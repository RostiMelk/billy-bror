import { useCallback, useMemo } from "react";
import { useOptimistic } from "react";
import { HeartIcon } from "lucide-react";
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

  const [optimisticEntry, addOptimisticEntry] = useOptimistic(
    entry,
    (currentEntry, optimisticLike: boolean) => ({
      ...currentEntry,
      likes:
        optimisticLike && session?.user
          ? [...(currentEntry.likes || []), session.user]
          : (currentEntry.likes || []).filter(
              (like) => like.email !== session?.user?.email,
            ),
    }),
  );

  const isLiked = useMemo(() => {
    const email = session?.user?.email;
    if (!email) return false;
    return optimisticEntry.likes?.some((like) => like.email === email);
  }, [optimisticEntry.likes, session]);

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const user = session?.user;
      if (!user) return;

      addOptimisticEntry(!isLiked);
      await likeEntry(entry._id);
    },
    [entry._id, isLiked, session, addOptimisticEntry],
  );

  const handleEdit = useCallback(() => {
    onEdit(entry);
  }, [entry, onEdit]);

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
                  onClick={handleLike}
                  className="gap-2 tabular-nums"
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={optimisticEntry.likes?.length}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "text-muted-foreground",
                        optimisticEntry.likes?.length &&
                          "text-primary font-semibold",
                      )}
                    >
                      {optimisticEntry.likes?.length || "0"}
                    </motion.span>
                  </AnimatePresence>
                  <HeartIcon
                    className={cn(
                      "w-4 h-4 text-muted-foreground",
                      isLiked && "text-red-500 fill-red-500",
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={8}>
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
