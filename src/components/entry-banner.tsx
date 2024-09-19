"use client";

import { useEntrySubscription } from "@/hooks/useEntrySubscription";
import { useTimer } from "@/hooks/useTimer";
import { usePathname } from "next/navigation";

export const EntryBanner = () => {
  const { activeEntry } = useEntrySubscription();
  const elapsedTime = useTimer(activeEntry?.startTime, { format: "short" });
  const pathname = usePathname();

  if (pathname === "/" || !activeEntry) {
    return null;
  }

  return (
    <header className="bg-green-400 text-sm dark:bg-green-600">
      <div className="container max-w-md flex justify-between py-2 px-4">
        <p className="font-medium text-center">Du er på tur!</p>
        <p className="font-medium tabular-nums">{elapsedTime}</p>
      </div>
    </header>
  );
};
