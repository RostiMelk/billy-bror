"use client";

import Link from "next/link";
import { useEntrySubscription } from "@/hooks/useEntrySubscription";
import { useTimer } from "@/hooks/useTimer";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { firstName, humanJoin } from "@/lib/utils";
import { useMemo } from "react";

export const EntryBanner = () => {
  const { activeEntry } = useEntrySubscription();
  const elapsedTime = useTimer(activeEntry?.startTime, { format: "short" });
  const pathname = usePathname();

  const peopleWalking = useMemo(() => {
    if (!activeEntry) return null;
    return humanJoin(activeEntry.users?.map((u) => firstName(u.name)));
  }, [activeEntry]);

  if (pathname === "/" || !activeEntry) {
    return null;
  }

  return (
    <Link href="/">
      <motion.header
        className="bg-green-400 text-sm dark:bg-green-600 overflow-hidden sticky top-0 z-50"
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{ delay: 0.5 }}
      >
        <div className="container max-w-xl flex justify-between py-2 px-4">
          <p className="font-medium text-center">{peopleWalking} er på tur!</p>
          <p className="font-medium tabular-nums">{elapsedTime}</p>
        </div>
      </motion.header>
    </Link>
  );
};
