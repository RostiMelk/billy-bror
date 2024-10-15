import { useTimeAgo } from "@/hooks/useTimeAgo";
import type { ResolvedEntryDocument } from "@/types/entry";
import { useMemo, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  FootprintsIcon,
  AwardIcon,
  TreePineIcon,
  TimerIcon,
  FlameIcon,
} from "lucide-react";
import { calculateStats } from "@/lib/process-entries-for-charts";
import { firstName, pluralize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getStreakCount } from "@/lib/actions";

interface QuickStatsProps {
  entries: ResolvedEntryDocument[];
}

const badgeStyle = "shrink-0 gap-1.5 py-2 px-3 items-center truncate";

export const QuickStats = ({ entries }: QuickStatsProps) => {
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    getStreakCount().then(setStreakCount);
  }, []);

  const entriesToday = useMemo(() => {
    return entries.filter(
      (entry) =>
        entry.status === "completed" &&
        new Date(entry.startTime).getDate() === new Date().getDate(),
    );
  }, [entries]);

  const lastTrip = useMemo(() => {
    return entries.find(
      (entry) => entry.location === "outside" && entry.status === "completed",
    );
  }, [entries]);

  const lastTripEnded = useTimeAgo(lastTrip?.endTime ?? 0);

  const todaysStats = useMemo(() => {
    return calculateStats(entriesToday);
  }, [entriesToday]);

  return (
    <section className="flex items-center gap-2.5 mb-6 flex-wrap">
      {streakCount > 0 && (
        <Badge className={cn("bg-red-200 text-red-950", badgeStyle)}>
          <FlameIcon size={16} />
          {streakCount} {pluralize(streakCount, "dag", "dager")} streak
        </Badge>
      )}
      <Badge className={cn("bg-green-200 text-green-950", badgeStyle)}>
        <FootprintsIcon size={16} />
        {lastTripEnded}
      </Badge>

      <Badge className={cn("bg-purple-200 text-purple-950", badgeStyle)}>
        <FootprintsIcon size={16} />
        {todaysStats.totalTrips} turer i dag
      </Badge>

      {todaysStats.topWalkers.length > 0 && (
        <Badge className={cn("bg-yellow-200 text-yellow-950", badgeStyle)}>
          <AwardIcon size={16} />
          {firstName(todaysStats.topWalkers?.[0]?.user.name)}
        </Badge>
      )}

      <Badge className={cn("bg-blue-200 text-blue-950", badgeStyle)}>
        <TreePineIcon size={16} />
        {(todaysStats?.successRate * 100).toFixed(0)}% suksess
      </Badge>

      <Badge className={cn("bg-orange-200 text-orange-950", badgeStyle)}>
        <TimerIcon size={16} />
        {todaysStats?.averageTripDuration.toFixed(0)} min snitt i dag
      </Badge>
    </section>
  );
};
