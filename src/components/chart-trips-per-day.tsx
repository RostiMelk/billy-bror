"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  date: string;
  trips: number;
};

export function ChartTripsPerDay({ chartData }: { chartData: ChartData[] }) {
  const chartConfig = {
    trips: {
      label: "Turer",
      color: "hsl(var(--chart-5))",
    },
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="trips" fill="var(--color-trips)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
