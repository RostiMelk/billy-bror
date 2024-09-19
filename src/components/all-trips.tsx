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
      </AnimatePresence>
    </ol>
  );
};
