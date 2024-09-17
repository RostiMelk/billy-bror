import type { EntryDocument, Location } from "@/types/entry";

export function processEntriesForPoopPeeChart(entries: EntryDocument[]) {
  const dailyStats = entries.reduce(
    (acc, entry) => {
      const date = new Date(entry.startTime).toISOString().split("T")[0];
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
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function processEntriesForTripsChart(entries: EntryDocument[]) {
  const dailyTrips = entries.reduce(
    (acc, entry) => {
      const date = new Date(entry.startTime).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(dailyTrips)
    .map(([date, trips]) => ({ date, trips }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateStats(entries: EntryDocument[]) {
  const totalTrips = entries.length;
  const totalPoops = entries.reduce(
    (sum, entry) => sum + (entry.poops || 0),
    0,
  );
  const totalPees = entries.reduce((sum, entry) => sum + (entry.pees || 0), 0);

  const days = new Set(
    entries.map(
      (entry) => new Date(entry.startTime).toISOString().split("T")[0],
    ),
  ).size;
  const averageTripsPerDay = totalTrips / days;

  const locationCounts = entries.reduce(
    (acc, entry) => {
      const location = entry.mode === "auto" ? "outside" : entry.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    },
    {} as Record<Location, number>,
  );

  const mostCommonLocation = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1],
  )[0][0];

  const longestTrip = entries.reduce((longest, entry) => {
    if (entry.endTime) {
      const duration =
        (new Date(entry.endTime).getTime() -
          new Date(entry.startTime).getTime()) /
        60000; // in minutes
      return Math.max(longest, duration);
    }
    return longest;
  }, 0);

  const successfulTrips = entries.filter(
    (entry) => (entry.poops || 0) > 0 || (entry.pees || 0) > 0,
  ).length;
  const successRate = successfulTrips / totalTrips;

  const outdoorTrips = entries.filter(
    (entry) => entry.mode === "auto" || entry.location === "outside",
  ).length;
  const outdoorPercentage = outdoorTrips / totalTrips;

  const totalDuration = entries.reduce((sum, entry) => {
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
  const averageTripDuration = totalDuration / totalTrips;

  return {
    totalTrips,
    totalPoops,
    totalPees,
    averageTripsPerDay,
    mostCommonLocation,
    longestTrip,
    successRate,
    outdoorPercentage,
    averageTripDuration,
  };
}
