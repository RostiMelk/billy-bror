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
  ThermometerIcon,
} from "lucide-react";
import { calculateStats } from "@/lib/process-entries-for-charts";
import { firstName, pluralize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getStreakCount, getTemperature } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

interface QuickStatsProps {
  entries: ResolvedEntryDocument[];
}

const badgeStyle = "shrink-0 gap-1.5 py-2 px-3 items-center truncate";

const badgeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

export const QuickStats = ({ entries }: QuickStatsProps) => {
  const [streakCount, setStreakCount] = useState(0);
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    getStreakCount().then(setStreakCount);
    getTemperature().then(setTemperature);
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

  const statsBadges = useMemo(() => {
    const badgeSet = new Set<{ key: string; badge: JSX.Element }>();

    if (streakCount > 0) {
      badgeSet.add({
        key: "streak",
        badge: (
          <Badge
            className={cn(
              "bg-gradient-to-r from-red-200 via-red-300 to-amber-300 text-red-950",
              badgeStyle,
            )}
          >
            <FlameIcon size={16} />
            {streakCount} {pluralize(streakCount, "dag", "dager")} streak
          </Badge>
        ),
      });
    }

    badgeSet.add({
      key: "lastTrip",
      badge: (
        <Badge className={cn("bg-green-200 text-green-950", badgeStyle)}>
          <FootprintsIcon size={16} />
          {lastTripEnded}
        </Badge>
      ),
    });

    if (temperature !== null) {
      badgeSet.add({
        key: "temperature",
        badge: (
          <Badge className={cn("bg-cyan-200 text-cyan-950", badgeStyle)}>
            <ThermometerIcon size={16} />
            {temperature.toFixed(1)}°C
          </Badge>
        ),
      });
    }

    badgeSet.add({
      key: "totalTrips",
      badge: (
        <Badge className={cn("bg-purple-200 text-purple-950", badgeStyle)}>
          <FootprintsIcon size={16} />
          {todaysStats.totalTrips} turer i dag
        </Badge>
      ),
    });

    badgeSet.add({
      key: "avgDuration",
      badge: (
        <Badge className={cn("bg-orange-200 text-orange-950", badgeStyle)}>
          <TimerIcon size={16} />
          {todaysStats?.averageTripDuration.toFixed(0)} min snitt i dag
        </Badge>
      ),
    });

    if (todaysStats.topWalkers.length > 0) {
      badgeSet.add({
        key: "topWalker",
        badge: (
          <Badge className={cn("bg-yellow-200 text-yellow-950", badgeStyle)}>
            <AwardIcon size={16} />
            {firstName(todaysStats.topWalkers?.[0]?.user.name)}
          </Badge>
        ),
      });
    }

    badgeSet.add({
      key: "successRate",
      badge: (
        <Badge className={cn("bg-blue-200 text-blue-950", badgeStyle)}>
          <TreePineIcon size={16} />
          {(todaysStats?.successRate * 100).toFixed(0)}% suksess
        </Badge>
      ),
    });

    return badgeSet;
  }, [streakCount, lastTripEnded, temperature, todaysStats]);

  return (
    <motion.section className="flex items-center gap-2.5 mb-6 flex-wrap" layout>
      <AnimatePresence>
        {Array.from(statsBadges).map(({ key, badge }, index) => (
          <motion.div
            key={key}
            layout
            initial="hidden"
            animate="visible"
            variants={badgeVariants}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {badge}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.section>
  );
};
