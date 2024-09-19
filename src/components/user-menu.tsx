"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const UserMenu = () => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar>
          <AvatarImage src={session.user.image ?? undefined} />
        </Avatar>
      </PopoverTrigger>

      <PopoverContent className="w-64" align="end" side="bottom" sideOffset={8}>
        <p className="font-sm font-semibold">{session.user.name}</p>
        <p className="text-sm text-muted-foreground">{session.user.email}</p>
        <Button
          onClick={async () => await signOut()}
          size="sm"
          className="mt-4 w-full"
          variant="outline"
        >
          Logg ut
        </Button>
      </PopoverContent>
    </Popover>
  );
};
