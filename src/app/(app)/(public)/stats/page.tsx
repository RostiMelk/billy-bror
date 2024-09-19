import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllCompletedEntries, getAllEntriesThisWeek } from "@/lib/actions";
import { ChartPeePoo } from "@/components/chart-pee-poo";
import { ChartTripsPerDay } from "@/components/chart-trips-per-day";
import { StatCard } from "@/components/start-card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  processEntriesForPoopPeeChart,
  processEntriesForTripsChart,
  calculateStats,
} from "@/lib/processEntriesForCharts";
import { pluralize } from "@/lib/utils";

export default async function Stats() {
  const allEntries = await getAllCompletedEntries();
  const thisWeeksEntries = await getAllEntriesThisWeek();

  const stats = calculateStats(thisWeeksEntries);
  const poopPeeChartData = processEntriesForPoopPeeChart(allEntries);
  const tripsChartData = processEntriesForTripsChart(thisWeeksEntries);

  return (
    <div className="p-4">
      <Header>
        <Button size="sm" variant="secondary" asChild>
          <Link href="/">Hjem</Link>
        </Button>
      </Header>

      <main className="my-8">
        <section className="mb-8">
          <h2 className="text-lg text-center mb-2 font-semibold">
            Topp turgåere denne uka 🏆
          </h2>

          <ul>
            {stats?.topWalkers.map((walker, index) => (
              <li
                key={walker.user.email}
                className="flex items-center p-3 border-b last:border-b-0"
              >
                <span className="text-sm font-semibold text-secondary-foreground mr-4">
                  {index + 1}
                </span>

                <Avatar className="mr-3">
                  <AvatarImage src={walker.user.image ?? undefined} />
                </Avatar>
                <p className="font-medium truncate">{walker.user.name}</p>

                <span className="text-sm font-semibold text-secondary-foreground ml-auto">
                  {walker.trips} {pluralize(walker.trips, "tur", "turer")}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg text-center mb-2 font-semibold">
            Statistikk for Billy siste 7 dager
          </h2>

          <div className="grid grid-cols-2">
            <StatCard title="Totalt antall turer" value={stats?.totalTrips} />
            <StatCard
              title="Snitt turer/dag"
              value={stats?.averageTripsPerDay.toFixed(1)}
            />
            <StatCard
              title="Billy har bæsja"
              value={`${stats?.totalPoops} ganger`}
            />
            <StatCard
              title="Billy har tissa"
              value={`${stats?.totalPees} ganger`}
            />
            <StatCard
              title="Lengste tur"
              value={`${stats?.longestTrip} minutter`}
            />
            <StatCard
              title="Suksessrate"
              value={`${(stats?.successRate * 100).toFixed(1)}%`}
            />
            <StatCard
              title="Gjør fra seg mest"
              value={
                stats?.mostCommonLocation === "outside" ? "Ute 🙂‍↕️" : "Inne 😭"
              }
            />
            <StatCard
              title="Snitt varighet"
              value={`${stats?.averageTripDuration.toFixed(1)} minutter`}
            />
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg text-center mb-2 font-semibold">
            Tiss og bæsj over tid
          </h2>
          <div className="w-full">
            <ChartPeePoo chartData={poopPeeChartData} />
          </div>
        </section>

        <section>
          <h2 className="text-lg text-center mb-2 font-semibold">
            Turer per dag siste 7 dager
          </h2>
          <div className="w-full">
            <ChartTripsPerDay chartData={tripsChartData} />
          </div>
        </section>
      </main>
    </div>
  );
}
