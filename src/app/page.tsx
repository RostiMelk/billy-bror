"use client";

import { getActiveEntry, startEntry } from "@/lib/actions";
import type { EntryDocument } from "@/types/entry";
import { Button } from "@/components/ui/button";
import { Suspense, useCallback, useEffect, useState } from "react";
import { SubmitDialog } from "@/components/submit-dialog";
import { Timer } from "@/components/timer";
import { LastTrip, LastTripSkeleton } from "@/components/last-trip";
import { PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/header";
import Link from "next/link";

const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function Home() {
  const [activeEntry, setActiveEntry] = useState<EntryDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);

  const handleOpenSubmit = useCallback(() => setShowSubmitDialog(true), []);
  const handleCloseSubmit = useCallback(() => setShowSubmitDialog(false), []);
  const handleSubmitted = useCallback(() => {
    setShowSubmitDialog(false);
    setActiveEntry(null);
  }, []);

  const fetchEntry = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedEntry = await getActiveEntry();
      setActiveEntry(fetchedEntry || null);
    } catch (error) {
      console.error("Error fetching entry:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartEntry = useCallback(async () => {
    const startTime = new Date().toISOString();
    const tempEntry: EntryDocument = {
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
      setActiveEntry(newEntry);
    } catch (error) {
      console.error("Error starting entry:", error);
      setActiveEntry(null);
    }
  }, []);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  if (isLoading) return null;

  return (
    <>
      <div className="text-center flex flex-col justify-between">
        <Header>
          <Button variant="outline" size="sm" asChild>
            <Link href="/stats">Statistikk</Link>
          </Button>

          {!activeEntry && (
            <Button
              size="icon"
              title="Legg til manuelt"
              variant="secondary"
              onClick={handleOpenSubmit}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          )}
        </Header>

        <main>
          <AnimatePresence mode="wait">
            {activeEntry ? (
              <motion.div key="timer" {...motionProps}>
                <Timer startTime={activeEntry.startTime} />
              </motion.div>
            ) : (
              <motion.div key="lastTrip" {...motionProps}>
                <Suspense fallback={<LastTripSkeleton />}>
                  <LastTrip />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="flex flex-col gap-3">
          {activeEntry ? (
            <>
              <p className="text-muted-foreground font-medium">
                Billy på tur, aldri sur
              </p>
              <Button
                size="lg"
                className="w-full"
                variant="destructive"
                onClick={handleOpenSubmit}
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
        entry={activeEntry}
        open={showSubmitDialog}
        onClose={handleCloseSubmit}
        onSubmit={handleSubmitted}
      />
    </>
  );
}
