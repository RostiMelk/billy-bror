import type { ResolvedEntryDocument } from "@/types/entry";
import { TripRow } from "./trip-row";

interface AllTripsProps {
  entries: ResolvedEntryDocument[];
  onEdit: (entry: ResolvedEntryDocument) => void;
}

export const AllTrips = ({ entries, onEdit }: AllTripsProps) => {
  return (
    <div>
      {entries?.map((entry) => (
        <TripRow key={entry._id} entry={entry} onEdit={onEdit} />
      ))}
    </div>
  );
};
