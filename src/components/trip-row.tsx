import { useCallback, useMemo, useState } from "react";
import { EditIcon, HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ResolvedEntryDocument } from "@/types/entry";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { useDuration } from "@/hooks/useDuration";
import { likeEntry } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TripRowProps {
  entry: ResolvedEntryDocument;
  onEdit: (entry: ResolvedEntryDocument) => void;
}

export const TripRow = ({ entry, onEdit }: TripRowProps) => {
  const timeAgo = useTimeAgo(entry.endTime ?? entry.startTime);
  const duration = useDuration(entry.startTime, entry.endTime);
  const isOutside = entry.location === "outside";
  const { data: session } = useSession();
  const [optimisticLikes, setOptimisticLikes] = useState(entry.likes || []);
  const [optimisticIsLiked, setOptimisticIsLiked] = useState(false);

  const isLiked = useMemo(() => {
    const email = session?.user?.email;
    if (!email) return false;
    return optimisticLikes.some((like) => like.email === email);
  }, [optimisticLikes, session]);

  const handleLike = useCallback(async () => {
    const user = session?.user;
    if (!user) return;

    setOptimisticIsLiked((prev) => !prev);
    setOptimisticLikes((prev) =>
      optimisticIsLiked
        ? prev.filter((like) => like.email !== user.email)
        : [...prev, user],
    );

    await likeEntry(entry._id);
  }, [entry, session, optimisticIsLiked]);

  const handleEdit = useCallback(() => {
    onEdit(entry);
  }, [entry, onEdit]);

  return (
    <div
      className="flex items-center py-3 pl-2 pr-1 border-b last:border-b-0"
      onDoubleClick={handleEdit}
    >
      <Avatar className="mr-4">
        <AvatarImage src={entry.user?.image ?? undefined} />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>

      <div className="text-left">
        <p className="text-md font-medium truncate">
          {timeAgo}
          {isOutside && `, i ${duration}`}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {entry.pees} 💦 {entry.poops} 💩{" "}
          {entry.location === "inside" ? "🏠" : "🌳"}
        </p>
      </div>
      <div className="ml-auto flex gap-1">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <EditIcon className="w-4 h-4 text-muted-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className="gap-2 tabular-nums"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={optimisticLikes.length}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {optimisticLikes.length}
            </motion.span>
          </AnimatePresence>
          <HeartIcon
            className={cn(
              "w-4 h-4 text-muted-foreground",
              isLiked && "text-red-500",
            )}
          />
        </Button>
      </div>
    </div>
  );
};
