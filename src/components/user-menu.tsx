"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { Session } from "next-auth";

interface UserMenuProps {
  session?: Session | null;
}

export const UserMenu = ({ session }: UserMenuProps) => {
  const { data: fallbackSession } = useSession();
  const activeSession = session || fallbackSession;

  if (!activeSession?.user) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar>
          <AvatarImage src={activeSession.user.image ?? undefined} />
        </Avatar>
      </PopoverTrigger>

      <PopoverContent className="w-64" align="end" side="bottom" sideOffset={8}>
        <p className="font-sm font-semibold">{activeSession.user.name}</p>
        <p className="text-sm text-muted-foreground">
          {activeSession.user.email}
        </p>

        <nav className="grid gap-2 mt-3">
          <Button
            onClick={async () => await signOut()}
            size="sm"
            className="w-full"
            variant="destructive"
          >
            Logg ut
          </Button>
        </nav>
      </PopoverContent>
    </Popover>
  );
};
