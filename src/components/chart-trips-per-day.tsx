"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
  displayDate: string;
  trips: number;
};

export function ChartTripsPerDay({ chartData }: { chartData: ChartData[] }) {
  const chartConfig = {
    trips: {
      label: "Turer",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis width={20} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="trips" fill="var(--color-trips)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
