import type { EntryDocument, Location } from "@/types/entry";
import { User } from "@/types/user";

const dateOptions: Intl.DateTimeFormatOptions = {
  year: "2-digit",
  month: "short",
  day: "2-digit",
};

/**
 * Process entries for poop and pee chart
 */
export function processEntriesForPoopPeeChart(entries: EntryDocument[]) {
  const dailyStats = entries.reduce(
    (acc, entry) => {
      const date = new Date(entry.startTime).toLocaleDateString(
        "no-NO",
        dateOptions,
      );
      if (!acc[date]) {
        acc[date] = {
          outsidePoops: 0,
          outsidePees: 0,
          insidePoops: 0,
          insidePees: 0,
        };
      }

      const isOutside = entry.mode === "auto" || entry.location === "outside";
      const poops = entry.poops || 0;
      const pees = entry.pees || 0;

      if (isOutside) {
        acc[date].outsidePoops += poops;
        acc[date].outsidePees += pees;
      } else {
        acc[date].insidePoops += poops;
        acc[date].insidePees += pees;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        outsidePoops: number;
        outsidePees: number;
        insidePoops: number;
        insidePees: number;
      }
    >,
  );

  return Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort(
      (a, b) =>
        new Date(a.date.split(".").reverse().join("-")).getTime() -
        new Date(b.date.split(".").reverse().join("-")).getTime(),
    );
}

/**
 * Process entries for trips chart
 */
export function processEntriesForTripsChart(entries: EntryDocument[]) {
  const dailyTrips = entries.reduce(
    (acc, entry) => {
      const date = new Date(entry.startTime).toLocaleDateString(
        "no-NO",
        dateOptions,
      );
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(dailyTrips)
    .map(([date, trips]) => ({ date, trips }))
    .sort(
      (a, b) =>
        new Date(a.date.split(".").reverse().join("-")).getTime() -
        new Date(b.date.split(".").reverse().join("-")).getTime(),
    );
}

/**
 * Process entries for stat cards
 */
export function calculateStats(entries: EntryDocument[]): {
  totalTrips: number;
  totalPoops: number;
  totalPees: number;
  averageTripsPerDay: number;
  mostCommonLocation: string;
  longestTrip: number;
  successRate: number;
  outdoorPercentage: number;
  averageTripDuration: number;
  topWalkers: Array<{ user: User; trips: number }>;
} {
  if (entries.length === 0) {
    return {
      totalTrips: 0,
      totalPoops: 0,
      totalPees: 0,
      averageTripsPerDay: 0,
      mostCommonLocation: "N/A",
      longestTrip: 0,
      successRate: 0,
      outdoorPercentage: 0,
      averageTripDuration: 0,
      topWalkers: [],
    };
  }

  const outdoorTrips = entries.filter(
    (entry) => entry.location === "outside" && entry.endTime,
  );
  const tripsWithToiletVisits = entries.filter(
    (entry) => entry.poops || entry.pees,
  );
  const outdoorTripsWithToiletVisits = outdoorTrips.filter(
    (entry) => entry.poops || entry.pees,
  );

  const totalTrips = entries.length;
  const totalOutsideTrips = outdoorTrips.length;
  const totalPoops = entries.reduce(
    (sum, entry) => sum + (entry.poops || 0),
    0,
  );
  const totalPees = entries.reduce((sum, entry) => sum + (entry.pees || 0), 0);
  const tripsWithWalkers = outdoorTrips.filter((entry) => entry.user);

  const days = new Set(
    entries.map(
      (entry) => new Date(entry.startTime).toISOString().split("T")[0],
    ),
  ).size;
  const averageTripsPerDay = totalOutsideTrips / days;

  const locationCounts = entries.reduce(
    (acc, entry) => {
      const location = entry.mode === "auto" ? "outside" : entry.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    },
    {} as Record<Location, number>,
  );

  const mostCommonLocation =
    Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const longestTrip = entries.reduce((longest, entry) => {
    if (entry.endTime) {
      const duration =
        (new Date(entry.endTime).getTime() -
          new Date(entry.startTime).getTime()) /
        60000;
      return Math.max(longest, duration);
    }
    return longest;
  }, 0);

  const successRate =
    outdoorTripsWithToiletVisits.length / tripsWithToiletVisits.length;
  const outdoorPercentage = totalOutsideTrips / totalTrips;

  const totalDuration = outdoorTrips.reduce((sum, entry) => {
    if (entry.endTime) {
      return (
        sum +
        (new Date(entry.endTime).getTime() -
          new Date(entry.startTime).getTime()) /
          60000
      );
    }
    return sum;
  }, 0);
  const averageTripDuration = totalDuration / totalOutsideTrips;

  // Sort walkers by number of trips
  const topWalkers = Object.entries(
    tripsWithWalkers.reduce(
      (acc, entry) => {
        if (entry.user) {
          acc[entry.user.email] = {
            user: entry.user,
            trips: (acc[entry.user.email]?.trips || 0) + 1,
          };
        }
        return acc;
      },
      {} as Record<string, { user: User; trips: number }>,
    ),
  )
    .sort((a, b) => b[1].trips - a[1].trips)
    .map(([, value]) => value)
    .slice(0, 5); // Get top 5 walkers

  return {
    totalTrips: totalOutsideTrips,
    totalPoops,
    totalPees,
    averageTripsPerDay,
    mostCommonLocation,
    longestTrip,
    successRate,
    outdoorPercentage,
    averageTripDuration,
    topWalkers,
  };
}
