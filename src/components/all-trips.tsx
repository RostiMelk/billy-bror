import type { ResolvedEntryDocument } from "@/types/entry";
import { TripRow } from "./trip-row";
import { AnimatePresence, motion } from "framer-motion";

interface AllTripsProps {
  entries: ResolvedEntryDocument[];
  onEdit: (entry: ResolvedEntryDocument) => void;
}

export const AllTrips = ({ entries, onEdit }: AllTripsProps) => {
  return (
    <ol>
      <AnimatePresence initial={false}>
        {entries?.map((entry) => (
          <motion.div
            key={entry._id}
            className="group"
            initial={{ opacity: 0, height: 0, scale: 0 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0 }}
          >
            <TripRow entry={entry} onEdit={onEdit} />
          </motion.div>
        ))}
        <p className="text-center text-sm text-muted-foreground pt-6">
          Viser resultater for de siste 7 dagene
        </p>
      </AnimatePresence>
    </ol>
  );
};
