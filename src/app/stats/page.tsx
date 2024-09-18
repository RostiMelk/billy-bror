import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllCompletedEntries } from "@/lib/actions";
import { ChartPeePoo } from "@/components/chart-pee-poo";
import { ChartTripsPerDay } from "@/components/chart-trips-per-day";
import { StatCard } from "@/components/start-card";
import {
  processEntriesForPoopPeeChart,
  processEntriesForTripsChart,
  calculateStats,
} from "@/lib/processEntriesForCharts";

export default async function Stats() {
  const entries = (await getAllCompletedEntries()) || [];

  const stats = calculateStats(entries);
  const poopPeeChartData = processEntriesForPoopPeeChart(entries);
  const tripsChartData = processEntriesForTripsChart(entries);

  return (
    <>
      <Header>
        <Button size="sm" variant="secondary" asChild>
          <Link href="/">Hjem</Link>
        </Button>
      </Header>

      <main className="my-8">
        <div className="grid grid-cols-2 mb-8">
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
            title="Snitt varighet"
            value={`${stats?.averageTripDuration.toFixed(1)} minutter`}
          />
        </div>

        <h2 className="text-lg text-center my-2 font-semibold mb-2">
          Tiss og bæsj over tid
        </h2>
        <div className="w-full mb-8">
          <ChartPeePoo chartData={poopPeeChartData} />
        </div>

        <h2 className="text-lg text-center my-2 font-semibold mb-2">
          Turer per dag
        </h2>
        <div className="w-full">
          <ChartTripsPerDay chartData={tripsChartData} />
        </div>
      </main>
    </>
  );
}
