import { useCallback, useMemo } from "react";
import { EditIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ResolvedEntryDocument } from "@/types/entry";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { useDuration } from "@/hooks/useDuration";

interface TripRowProps {
  entry: ResolvedEntryDocument;
  onEdit: (entry: ResolvedEntryDocument) => void;
}

export const TripRow = ({ entry, onEdit }: TripRowProps) => {
  const timeAgo = useTimeAgo(entry.endTime ?? entry.startTime);
  const duration = useDuration(entry.startTime, entry.endTime);
  const isOutside = entry.location === "outside";

  const handleEdit = useCallback(() => {
    onEdit(entry);
  }, [entry, onEdit]);

  return (
    <div
      className="flex items-center p-3 border-b last:border-b-0"
      onDoubleClick={handleEdit}
    >
      <Avatar className="mr-4">
        <AvatarImage src={entry.user?.image ?? undefined} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>

      <div className="text-left">
        <p className="text-md font-medium">
          {timeAgo}
          {isOutside && `, i ${duration}`}
        </p>
        <p className="text-sm text-gray-500">
          {entry.pees} 💦 {entry.poops} 💩{" "}
          {entry.location === "inside" ? "🏠" : "🌳"}
        </p>
      </div>
      <div className="ml-auto">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <EditIcon className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
