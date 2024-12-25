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

  // Group data into weeks based on actual dates
  const weeklyData = chartData
    .reduce((weeks: ChartData[][], entry) => {
      const date = new Date(entry.date);
      const dayOfWeek = date.getDay();
      const weekIndex = Math.floor(weeks.length);

      // Start new week if this is first entry or it's Monday (dayOfWeek === 1)
      if (weeks.length === 0 || dayOfWeek === 1) {
        weeks.push([entry]);
      } else {
        // Add to current week
        weeks[weekIndex - 1].push(entry);
      }

      return weeks;
    }, [])
    .reverse();

  const highestValue = Math.max(...chartData.map((data) => data.trips));

  return (
    <ChartContainer config={chartConfig} className="mb-28 sm:mb-0">
      <div className="relative grid grid-cols-[auto_1fr]">
        <div className="sticky left-0">
          <ResponsiveContainer width={20} height="100%">
            <BarChart margin={{ left: 0 }}>
              <XAxis /> {/* Empty x-axis to align the bottom */}
              <YAxis width={20} domain={[0, highestValue]} tickCount={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 grid grid-flow-col auto-cols-[100%] overflow-x-auto snap-x snap-mandatory  overscroll-x-contain [direction:rtl]">
          {weeklyData.map((weekData, index) => (
            <div key={index} className="snap-start [direction:ltr] snap-always">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekData} margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis hide domain={[0, highestValue]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="trips"
                    fill="var(--color-trips)"
                    radius={[4, 4, 0, 0]}
                  >
                    <ChartTooltipContent />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
}
