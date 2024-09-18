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

export const fetchCache = "force-no-store";

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
          <StatCard title="Total Trips" value={stats?.totalTrips} />
          <StatCard
            title="Avg Trips/Day"
            value={stats?.averageTripsPerDay.toFixed(1)}
          />
          <StatCard title="Total Poops" value={stats?.totalPoops} />
          <StatCard title="Total Pees" value={stats?.totalPees} />
          <StatCard
            title="Longest Trip"
            value={`${stats?.longestTrip} minutes`}
          />
          <StatCard
            title="Success Rate"
            value={`${(stats?.successRate * 100).toFixed(1)}%`}
          />
          <StatCard
            title="Avg Trip Duration"
            value={`${stats?.averageTripDuration.toFixed(1)} minutes`}
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
