import { useCallback, useMemo } from "react";
import type { EntryDocument } from "@/types/entry";
import { Button } from "./ui/button";
import { EditIcon } from "lucide-react";

interface AllTripsProps {
  entries: EntryDocument[];
  onEdit: (entry: EntryDocument) => void;
}

interface TripRowProps {
  entry: EntryDocument;
  onEdit: (entry: EntryDocument) => void;
}

const formatTime = (entry: EntryDocument) => {
  const startDate = new Date(entry.startTime as string);
  const endDate = new Date(entry.endTime as string);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    if (date.toDateString() === today.toDateString()) {
      return formatTime(date);
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `i går, ${formatTime(date)}`;
    }
    return date.toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const TripRow = ({ entry, onEdit }: TripRowProps) => {
  const time = useMemo(() => formatTime(entry), [entry]);

  const handleEdit = useCallback(() => {
    onEdit(entry);
  }, [entry, onEdit]);

  return (
    <div
      className="flex justify-between items-center p-3 border-b last:border-b-0"
      onDoubleClick={handleEdit}
    >
      <div className="text-left">
        <p className="text-md font-medium">{time}</p>
        <p className="text-sm text-gray-500">
          {entry.pees} 💦 {entry.poops} 💩{" "}
          {entry.location === "inside" ? "🏠" : "🌳"}
        </p>
      </div>
      <div>
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <EditIcon className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
