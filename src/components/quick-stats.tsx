import { useTimeAgo } from "@/hooks/useTimeAgo";
import type { ResolvedEntryDocument } from "@/types/entry";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { FootprintsIcon, AwardIcon, TreePineIcon } from "lucide-react";
import { calculateStats } from "@/lib/process-entries-for-charts";
import { firstName } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  entries: ResolvedEntryDocument[];
}

const badgeStyle =
  "gap-1.5 py-2 px-3 grid grid-cols-[1fr,auto,1fr] items-center truncate";

export const QuickStats = ({ entries }: QuickStatsProps) => {
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
    <section className="grid grid-cols-2 items-center gap-2.5 mb-6 justify-center flex-wrap">
      <Badge className={cn("bg-green-200 text-green-950", badgeStyle)}>
        <FootprintsIcon size={16} />
        {lastTripEnded}
      </Badge>

      <Badge className={cn("bg-purple-200 text-purple-950", badgeStyle)}>
        <FootprintsIcon size={16} />
        {entriesToday.length} turer i dag
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
    </section>
  );
};
