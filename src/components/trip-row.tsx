import { useCallback, useMemo, useState } from "react";
import { HeartIcon, ThumbsDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { ResolvedEntryDocument } from "@/types/entry";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { useDuration } from "@/hooks/useDuration";
import { likeEntry } from "@/lib/actions";
import { useSession } from "next-auth/react";
import { cn, firstName } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TripRowProps {
  entry: ResolvedEntryDocument;
  onEdit: (entry: ResolvedEntryDocument) => void;
}

export const TripRow = ({ entry, onEdit }: TripRowProps) => {
  const timeAgo = useTimeAgo(entry.endTime ?? entry.startTime);
  const duration = useDuration(entry.startTime, entry.endTime);
  const isOutside = entry.location === "outside";
  const { data: session } = useSession();
  const [optimisticEntry, setOptimisticEntry] = useState(entry);

  const reacted = useMemo(() => {
    const email = session?.user?.email;
    if (!email) return false;
    return optimisticEntry.likes?.some((like) => like.email === email) ?? false;
  }, [optimisticEntry.likes, session]);

  const handleReact = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const user = session?.user;
      if (!user) return;

      const newLikes = reacted
        ? optimisticEntry.likes?.filter((like) => like.email !== user.email) ||
          []
        : [...(optimisticEntry.likes || []), user];

      setOptimisticEntry((prev) => ({
        ...prev,
        likes: newLikes,
      }));
      await likeEntry(entry._id);
    },
    [entry._id, reacted, session, optimisticEntry.likes],
  );

  const handleEdit = useCallback(() => {
    onEdit(entry);
  }, [entry, onEdit]);

  // When the entry is outside, we show a heart icon, otherwise a thumbs down
  // They're both treated as a like action.
  const ReactionIcon = isOutside ? HeartIcon : ThumbsDownIcon;

  console.log("likes", reacted);

  return (
    <li>
      <button
        type="button"
        className="w-full flex items-center py-3 pl-2 pr-1 group-first:pt-0 group-last:pb-0 border-b group-last:border-b-0"
        onClick={handleEdit}
      >
        <div className="flex -space-x-3 overflow-hidden mr-2">
          {optimisticEntry.users?.slice(0, 3).map((user) => (
            <Avatar key={user.email} className="border-2 border-background">
              <AvatarImage src={user.image ?? undefined} />
            </Avatar>
          ))}
        </div>

        <div className="text-left">
          <p className="text-sm font-medium truncate">
            {timeAgo}
            {isOutside && `, i ${duration}`}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {optimisticEntry.pees} 💦 {optimisticEntry.poops} 💩{" "}
            {optimisticEntry.location === "inside" ? "🏠" : "🌳"}
          </p>
        </div>
        <div className="ml-auto flex gap-1">
          <TooltipProvider>
            <Tooltip delayDuration={optimisticEntry.likes?.length ? 200 : 1e9}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReact}
                  className="tabular-nums"
                  key={optimisticEntry.likes?.length}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={optimisticEntry.likes?.length}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "text-primary font-semibold",
                        optimisticEntry.likes?.length && "mr-2",
                      )}
                    >
                      {optimisticEntry.likes?.length || ""}
                    </motion.span>
                  </AnimatePresence>
                  <ReactionIcon
                    key={optimisticEntry.likes?.length}
                    className={cn(
                      "w-4 h-4 text-muted-foreground",
                      reacted && isOutside && "text-red-500 fill-red-500",
                      reacted && !isOutside && "text-amber-500 fill-amber-500",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8} align="end">
                <p className="text-xs">
                  {optimisticEntry.likes
                    ?.map((like) => firstName(like.name))
                    .join(", ")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </button>
    </li>
  );
};
