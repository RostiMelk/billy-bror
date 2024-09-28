"use client";

import { useSession, signOut } from "next-auth/react";
import { saveAs } from "file-saver";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { hashEmail } from "@/lib/utils";
import { createSiriShortcut } from "@/lib/siri-shortcut";

export const UserMenu = () => {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleCreateStartEntrySiriShortcut = () => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }
    const apiUrl = "https://billy.rosti.no/api/siri/start-entry";
    const apiBody = { hash: hashEmail(session.user.email) };
    const shortcutName = "Start trip";
    const shortcutData = createSiriShortcut(apiUrl, apiBody, shortcutName);
    const blob = new Blob([shortcutData], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `${shortcutName}.shortcut`);
    return shortcutName;
  };

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

        <nav className="grid gap-2 mt-3">
          {/*<Button
            onClick={handleCreateStartEntrySiriShortcut}
            size="sm"
            className="w-full"
            variant="ghost"
          >
            Lag en Siri snarvei
          </Button>*/}

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
