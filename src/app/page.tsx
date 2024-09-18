"use client";

import { startEntry } from "@/lib/actions";
import type { EntryDocument } from "@/types/entry";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { SubmitDialog } from "@/components/submit-dialog";
import { Timer } from "@/components/timer";
import { AllTrips } from "@/components/all-trips";
import { PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/header";
import Link from "next/link";
import { client } from "@/lib/sanity";
import groq from "groq";
import type { MutationEvent } from "@sanity/client";
const ACTIVE_ENTRY_QUERY = groq`*[_type == "entry" && status == "active" && mode == "auto"][0]`;
const ALL_ENTRIES = groq`*[_type == "entry" && status == "completed"] | order(endTime desc)`;

const motionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

type EntryEvent = MutationEvent<EntryDocument>;

export default function Home() {
  const [activeEntry, setActiveEntry] = useState<EntryDocument | null>(null);
  const [editingEntry, setEditingEntry] = useState<EntryDocument | null>(null);
  const [allEntries, setAllEntries] = useState<EntryDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState<boolean>(false);

  const handleOpenSubmit = useCallback(() => setShowSubmitDialog(true), []);
  const handleEditEntry = useCallback((entry: EntryDocument) => {
    setShowSubmitDialog(true);
    setEditingEntry(entry);
  }, []);
  const handleCloseSubmit = useCallback(() => {
    setShowSubmitDialog(false);
    setEditingEntry(null);
  }, []);
  const handleSubmitted = useCallback(() => {
    setShowSubmitDialog(false);
    setActiveEntry(null);
    setEditingEntry(null);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      client.fetch(ACTIVE_ENTRY_QUERY),
      client.fetch(ALL_ENTRIES),
    ]).then(([activeEntry, allEntries]) => {
      setActiveEntry(activeEntry);
      setAllEntries(allEntries);
      setIsLoading(false);
    });

    const activeSubscription = client
      .listen(ACTIVE_ENTRY_QUERY, {}, { visibility: "query" })
      .subscribe((update) => {
        if (update.type === "mutation" && update.eventId === "delete") {
          setActiveEntry(null);
          return;
        }
        if (update.type === "mutation" && update.result) {
          const newEntry = update.result as unknown as EntryDocument;
          if (newEntry.status === "completed") {
            setActiveEntry(null);
          } else {
            setActiveEntry(newEntry);
          }
        }
      });

    const latestSubscription = client
      .listen<EntryEvent>(ALL_ENTRIES, {}, { visibility: "query" })
      .subscribe((update) => {
        if (update.type === "mutation" && update.transition === "disappear") {
          setAllEntries((entries) =>
            entries.filter((entry) => entry._id !== update.documentId),
          );
        } else if (update.type === "mutation") {
          const entry = update.result;
          if (entry) {
            // @ts-ignore result is not null
            setAllEntries((entries) => {
              const index = entries.findIndex((prev) => prev._id === entry._id);
              return index === -1
                ? [entry, ...entries]
                : entries.map((e, i) => (i === index ? entry : e));
            });
          }
        }
      });

    return () => {
      activeSubscription.unsubscribe();
      latestSubscription.unsubscribe();
    };
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
                <Timer startTime={activeEntry.startTime as string} />
              </motion.div>
            ) : (
              <motion.div key="lastTrip" {...motionProps}>
                <AllTrips entries={allEntries} onEdit={handleEditEntry} />
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
        entry={editingEntry || activeEntry}
        open={showSubmitDialog}
        onClose={handleCloseSubmit}
        onSubmit={handleSubmitted}
      />
    </>
  );
}
