import React from "react";
import type { ResolvedEntryDocument } from "@/types/entry";
import { TripRow } from "./trip-row";
import { AnimatePresence, motion } from "framer-motion";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LoaderCircleIcon } from "lucide-react";

interface AllTripsProps {
  entries: ResolvedEntryDocument[];
  onEdit: (entry: ResolvedEntryDocument) => void;
  loadMore: () => void;
  hasNextPage: boolean;
}

export const AllTrips = ({
  entries,
  onEdit,
  loadMore,
  hasNextPage,
}: AllTripsProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? entries.length + 1 : entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 5,
  });

  React.useEffect(() => {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);

    if (!lastItem) {
      return;
    }

    if (lastItem.index === entries.length - 1) {
      loadMore();
    }
  }, [hasNextPage, entries.length, loadMore, rowVirtualizer]);

  return (
    <div ref={parentRef}>
      <ol
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <AnimatePresence initial={false}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const entry = entries[virtualRow.index];
            return (
              <motion.li
                key={virtualRow.index}
                className="group"
                // initial={{ opacity: 0, height: 0, scale: 0 }}
                // animate={{ opacity: 1, height: "auto", scale: 1 }}
                // exit={{ opacity: 0, height: 0, scale: 0 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {virtualRow.index}
                {entry ? (
                  <TripRow entry={entry} onEdit={onEdit} />
                ) : (
                  hasNextPage && (
                    <LoaderCircleIcon className="animate-spin text-muted-foreground mx-auto h-full" />
                  )
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
};
