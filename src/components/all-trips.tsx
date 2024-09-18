import type { EntryDocument } from "@/types/entry";
import { TripRow } from "./trip-row";

interface AllTripsProps {
  entries: EntryDocument[];
  onEdit: (entry: EntryDocument) => void;
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
