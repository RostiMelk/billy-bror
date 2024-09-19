"use client";

import { startEntry } from "@/lib/actions";
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

  useEffect(() => {
    const visibilityChangeHandler = async () => {
      if (document.visibilityState !== "visible") return;
      const message = activeEntry
        ? "Håper du har hatt en fin tur! 🐕‍🦺"
        : "Klar for ny tur? Velkommen tilbake! 👋";
      const description = activeEntry
        ? "Trykk på stopp for å avslutte turen"
        : "Trykk på start for å begynne en ny tur";
      toast(message, { description });
    };

    window.addEventListener("visibilitychange", visibilityChangeHandler);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("visibilitychange", visibilityChangeHandler);
      document.body.style.overflow = "auto";
    };
  }, [activeEntry]);

  const handleStartEntry = useCallback(async () => {
    const startTime = new Date().toISOString();
    const tempEntry: ResolvedEntryDocument = {
      _id: "temp",
      _type: "entry",
      startTime,
      status: "active",
      mode: "auto",
      location: "outside",
    };
    setActiveEntry(tempEntry);

    try {
      const newEntry = await startEntry();
      setActiveEntry(newEntry as ResolvedEntryDocument);
    } catch (error) {
      console.error("Error starting entry:", error);
      setActiveEntry(null);
    }
  }, [setActiveEntry]);

  if (isLoading) return null;

  return (
    <>
      <div className="text-center grid grid-rows-[auto,1fr,auto] h-[100dvh] p-4">
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
                <Timer startTime={activeEntry.startTime} />
              </motion.div>
            ) : (
              <motion.div key="lastTrip" {...motionProps}>
                <AllTrips entries={allEntries} onEdit={handleEditEntry} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="flex flex-col gap-3 pb-safe tall:pb-8">
          {activeEntry ? (
            <>
              <p className="text-muted-foreground font-medium">
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
              <p className="text-muted-foreground font-medium">
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
