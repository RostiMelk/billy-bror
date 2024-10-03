"use client";

import type { ResolvedEntryDocument } from "@/types/entry";
import { useTimer } from "../hooks/useTimer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { firstName } from "@/lib/utils";
import { motion } from "framer-motion";
interface TimerProps {
  entry: ResolvedEntryDocument;
}

export const Timer = ({ entry }: TimerProps) => {
  const elapsedTime = useTimer(entry.startTime);
  const hasUsers = Boolean(entry?.users?.length);

  return (
    <div className="flex flex-col items-center">
      <motion.p
        className="flex items-center gap-1.5 mb-4 flex-wrap justify-center max-w-sm min-h-9"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
        animate={hasUsers ? "visible" : "hidden"}
      >
        {entry?.users?.map((user, index, array) => (
          <>
            <Badge
              variant="outline"
              key={user.email}
              className="text-md gap-1.5 pr-2"
            >
              <Avatar className="border-2 border-background size-7">
                <AvatarImage src={user.image ?? undefined} />
              </Avatar>
              {firstName(user.name)}
            </Badge>
            {index < array.length - 2 && ", "}
            {index === array.length - 2 && " og "}
          </>
        ))}
        <span>er på tur</span>
      </motion.p>

      <p className="text-7xl tabular-nums font-medium">{elapsedTime}</p>
    </div>
  );
};
