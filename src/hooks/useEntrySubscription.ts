import { useState, useEffect, useCallback, useMemo } from "react";
import { client } from "@/lib/client";
import groq from "groq";
import type { ResolvedEntryDocument } from "@/types/entry";
import type { MutationEvent } from "@sanity/client";

const ENTRY_PROJECTION = groq`{ ..., users[]->, likes[]-> }`;
const ACTIVE_ENTRY_QUERY = groq`*[_type == "entry" && status == "active" && mode == "auto"][0] ${ENTRY_PROJECTION}`;
const ALL_ENTRIES = groq`*[_type == "entry" && status == "completed" && startTime > $weekAgo] | order(coalesce(endTime, startTime) desc) ${ENTRY_PROJECTION}`;

type EntryEvent = MutationEvent<ResolvedEntryDocument>;

export function useEntrySubscription() {
  const [activeEntry, setActiveEntry] = useState<ResolvedEntryDocument | null>(
    null,
  );
  const [allEntries, setAllEntries] = useState<ResolvedEntryDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const weekAgo = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);
    return weekAgo.toISOString();
  }, []);

  const fetchEntries = useCallback(async () => {
    const [activeEntry, allEntries] = await Promise.all([
      client.fetch(ACTIVE_ENTRY_QUERY),
      client.fetch(ALL_ENTRIES, { weekAgo }),
    ]);
    setActiveEntry(activeEntry);
    setAllEntries(allEntries);
    setIsLoading(false);

    return [activeEntry, allEntries];
  }, [weekAgo]);

  useEffect(() => {
    const activeSubscription = client
      .listen(ACTIVE_ENTRY_QUERY, {}, { visibility: "query" })
      .subscribe(async (update) => {
        if (update.type === "mutation" && update.eventId === "delete") {
          setActiveEntry(null);
          return;
        }
        if (update.type === "mutation" && update.result) {
          const newEntry = update.result as unknown as ResolvedEntryDocument;
          if (newEntry.status === "completed") {
            setActiveEntry(null);
          } else {
            setActiveEntry({
              ...newEntry,
              users: activeEntry?.users || [], // Referenced item, reuse until new data is fetched
            });
            const fullEntry = await client.fetch(
              groq`*[_type == "entry" && _id == $id][0] ${ENTRY_PROJECTION}`,
              { id: newEntry._id },
            );
            setActiveEntry(fullEntry);
          }
        }
      });

    const allEntriesSubscription = client
      .listen<EntryEvent>(ALL_ENTRIES, { weekAgo }, { visibility: "query" })
      .subscribe(async (update) => {
        if (update.type === "mutation" && update.transition === "disappear") {
          setAllEntries((entries) =>
            entries.filter((entry) => entry._id !== update.documentId),
          );
        } else if (update.type === "mutation") {
          const entry = update.result;
          if (entry) {
            const fullEntry = await client.fetch(
              groq`*[_type == "entry" && _id == $id][0] ${ENTRY_PROJECTION}`,
              { id: entry._id },
            );
            setAllEntries((entries) => {
              const index = entries.findIndex((e) => e._id === fullEntry._id);
              return index === -1
                ? [fullEntry, ...entries]
                : entries.map((e, i) => (i === index ? fullEntry : e));
            });
          }
        }
      });

    const visibilityChangeHandler = async () => {
      if (document.visibilityState !== "visible") return;
      fetchEntries();
    };

    setIsLoading(true);
    fetchEntries();
    window.addEventListener("visibilitychange", visibilityChangeHandler);

    return () => {
      activeSubscription.unsubscribe();
      allEntriesSubscription.unsubscribe();
      window.removeEventListener("visibilitychange", visibilityChangeHandler);
    };
  }, [fetchEntries, weekAgo]);

  return { activeEntry, setActiveEntry, allEntries, isLoading };
}
