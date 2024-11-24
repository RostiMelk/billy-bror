"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  date: string;
  displayDate: string;
  outsidePoops: number;
  outsidePees: number;
  insidePoops: number;
  insidePees: number;
};

export function ChartPeePoo({ chartData }: { chartData: ChartData[] }) {
  const chartConfig = {
    outsidePoops: {
      label: "💩 ute",
      color: "hsl(var(--chart-1))",
    },
    outsidePees: {
      label: "💦 ute",
      color: "hsl(var(--chart-2))",
    },
    insidePoops: {
      label: "💩 inne",
      color: "hsl(var(--chart-3))",
    },
    insidePees: {
      label: "💦 inne",
      color: "hsl(var(--chart-4))",
    },
  };

  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="displayDate" />
          <YAxis width={20} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            type="monotone"
            dot={false}
            dataKey="outsidePoops"
            stroke="var(--color-outsidePoops)"
          />
          <Line
            type="monotone"
            dataKey="outsidePees"
            stroke="var(--color-outsidePees)"
          />
          <Line
            type="monotone"
            dataKey="insidePoops"
            stroke="var(--color-insidePoops)"
          />
          <Line
            type="monotone"
            dataKey="insidePees"
            stroke="var(--color-insidePees)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
