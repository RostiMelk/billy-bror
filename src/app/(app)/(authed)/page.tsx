"use client";

import { startEntry, appendMyselfToEntry } from "@/lib/actions";
import type { ResolvedEntryDocument } from "@/types/entry";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { SubmitDialog } from "@/components/submit-dialog";
import { Timer } from "@/components/timer";
import { AllTrips } from "@/components/all-trips";
import { PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/header";
import Link from "next/link";
import { toast } from "sonner";
import { useEntrySubscription } from "@/hooks/useEntrySubscription";
import { useIsPwa } from "@/hooks/useIsPwa";
import { cn, firstName, humanJoin } from "@/lib/utils";
import { useSession } from "next-auth/react";

const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const { activeEntry, setActiveEntry, allEntries, isLoading } =
    useEntrySubscription();
  const [editingEntry, setEditingEntry] =
    useState<ResolvedEntryDocument | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);
  const session = useSession();
  const isPwa = useIsPwa();

  const handleAddManually = useCallback(() => {
    setShowSubmitDialog(true);
    setEditingEntry(null);
  }, []);
  const handleStopEntry = useCallback(() => {
    setShowSubmitDialog(true);
    setEditingEntry(null);
  }, []);
  const handleEditEntry = useCallback((entry: ResolvedEntryDocument) => {
    setShowSubmitDialog(true);
    setEditingEntry(entry);
  }, []);
  const handleOnCloseSubmitDialog = useCallback(() => {
    setShowSubmitDialog(false);
    setEditingEntry(null);
  }, []);
  const handleOnSubmit = useCallback(() => {
    setShowSubmitDialog(false);
    setActiveEntry(null);
    setEditingEntry(null);
  }, [setActiveEntry]);

  const handleAppendMyselfToEntry = useCallback(() => {
    if (!activeEntry) return;
    appendMyselfToEntry(activeEntry._id);
    toast("Du er lagt til på turen 💚", {
      description: "Kos dere ute!",
    });
  }, [activeEntry]);

  useEffect(() => {
    const visibilityChangeHandler = async () => {
      if (document.visibilityState !== "visible") return;

      const sessionUserIsWalking = activeEntry?.users?.some(
        (user) => user.email === session.data?.user?.email,
      );
      const walkerNames = activeEntry?.users?.map((w) => firstName(w.name));
      const canJoin = !sessionUserIsWalking && activeEntry;

      const activeTripMessage = sessionUserIsWalking
        ? "Håper du har hatt en fin tur! 🐕‍🦺"
        : `${humanJoin(walkerNames)} er på tur! 🤩`;

      const message = activeEntry
        ? activeTripMessage
        : "Klar for ny tur? Velkommen tilbake! 👋";
      const description = activeEntry
        ? "Trykk på stopp for å avslutte turen"
        : "Trykk på start for å begynne en ny tur";
      const action = canJoin && {
        label: "Bli med!",
        onClick: handleAppendMyselfToEntry,
      };

      toast(message, { description, action });
    };

    window.addEventListener("visibilitychange", visibilityChangeHandler);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("visibilitychange", visibilityChangeHandler);
      document.body.style.overflow = "auto";
    };
  }, [activeEntry, session]);

  const handleStartEntry = useCallback(async () => {
    const startTime = new Date().toISOString();
    const tempEntry: ResolvedEntryDocument = {
      _id: "temp",
      _type: "entry",
      startTime,
      status: "active",
      mode: "auto",
      location: "outside",
      users: session.data?.user ? [{ ...session.data.user }] : [],
    };
    setActiveEntry(tempEntry);

    try {
      const newEntry = await startEntry(startTime);
      setActiveEntry(newEntry as ResolvedEntryDocument);
    } catch (error) {
      console.error("Error starting entry:", error);
      setActiveEntry(null);
    }
  }, [setActiveEntry, session]);

  if (isLoading) return null;

  return (
    <>
      <div className="text-center grid grid-rows-[auto,1fr,auto] h-[100dvh] p-4 gap-6">
        <Header>
          <Button variant="outline" size="sm" asChild>
            <Link href="/stats">Statistikk</Link>
          </Button>

          {!activeEntry && (
            <Button
              size="icon"
              title="Legg til manuelt"
              variant="secondary"
              onClick={handleAddManually}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          )}
        </Header>

        <main className="overflow-auto fade grid items-center">
          <AnimatePresence mode="wait">
            {activeEntry ? (
              <motion.div key="timer" {...motionProps}>
                <Timer entry={activeEntry} />
              </motion.div>
            ) : (
              <motion.div key="lastTrip" {...motionProps}>
                <AllTrips entries={allEntries} onEdit={handleEditEntry} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer
          className={cn("flex flex-col gap-3", {
            "pb-6": isPwa,
          })}
        >
          {activeEntry ? (
            <>
              <p className="text-sm text-muted-foreground font-medium">
                Billy på tur, aldri sur
              </p>
              <Button
                size="lg"
                className="w-full"
                variant="destructive"
                onClick={handleStopEntry}
              >
                Avslutt turen
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-medium">
                Trykk på knappen for å starte en ny tur
              </p>
              <Button
                size="lg"
                className="w-full"
                variant="positive"
                onClick={handleStartEntry}
                type="button"
              >
                Start en ny tur
              </Button>
            </>
          )}
        </footer>
      </div>

      <SubmitDialog
        entry={editingEntry || activeEntry}
        open={showSubmitDialog}
        onClose={handleOnCloseSubmitDialog}
        onSubmit={handleOnSubmit}
      />
    </>
  );
}
