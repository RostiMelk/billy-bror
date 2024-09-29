import { useState, useEffect, useCallback } from "react";
import { client } from "@/lib/client";
import groq from "groq";
import type { ResolvedEntryDocument } from "@/types/entry";
import type { MutationEvent } from "@sanity/client";

const ENTRY_PROJECTION = groq`{ ..., users[]->, likes[]-> }`;
const ACTIVE_ENTRY_QUERY = groq`*[_type == "entry" && status == "active" && mode == "auto"][0] ${ENTRY_PROJECTION}`;
const ALL_ENTRIES = groq`*[_type == "entry" && status == "completed"] | order(coalesce(endTime, startTime) desc) ${ENTRY_PROJECTION}`;

type EntryEvent = MutationEvent<ResolvedEntryDocument>;

const PAGE_SIZE = 20;

export function useEntrySubscription() {
  const [activeEntry, setActiveEntry] = useState<ResolvedEntryDocument | null>(
    null,
  );
  const [allEntries, setAllEntries] = useState<ResolvedEntryDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const fetchEntries = useCallback(async (page: number) => {
    const [activeEntry, fetchedEntries] = await Promise.all([
      client.fetch(ACTIVE_ENTRY_QUERY),
      client.fetch(
        `${ALL_ENTRIES}[${(page - 1) * PAGE_SIZE}...${page * PAGE_SIZE}]`,
      ),
    ]);

    setActiveEntry(activeEntry);
    setAllEntries((prev) => [...prev, ...fetchedEntries]);
    setHasNextPage(fetchedEntries.length === PAGE_SIZE);
    setIsLoading(false);

    return [activeEntry, fetchedEntries];
  }, []);

  const loadMore = useCallback(() => {
    if (!hasNextPage || isLoading) return;
    setPageNumber((prev) => prev + 1);
    setIsLoading(true);
    fetchEntries(pageNumber + 1);
  }, [hasNextPage, isLoading, fetchEntries, pageNumber]);

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
            setActiveEntry(newEntry);
            const fullEntry = await client.fetch(
              groq`*[_type == "entry" && _id == $id][0] ${ENTRY_PROJECTION}`,
              { id: newEntry._id },
            );
            setActiveEntry(fullEntry);
          }
        }
      });

    const allEntriesSubscription = client
      .listen<EntryEvent>(ALL_ENTRIES, {}, { visibility: "query" })
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
      setPageNumber(1);
      setAllEntries([]);
      fetchEntries(1);
    };

    setIsLoading(true);
    fetchEntries(1);
    window.addEventListener("visibilitychange", visibilityChangeHandler);

    return () => {
      activeSubscription.unsubscribe();
      allEntriesSubscription.unsubscribe();
      window.removeEventListener("visibilitychange", visibilityChangeHandler);
    };
  }, [fetchEntries]);

  return {
    activeEntry,
    setActiveEntry,
    allEntries,
    isLoading,
    loadMore,
    hasNextPage,
  };
}
