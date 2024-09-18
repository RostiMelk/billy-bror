"use server";

import { serverClient } from "@/lib/sanity";
import { type EntryDocument, AutoEntry, ManualEntry } from "@/types/entry";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

export async function getActiveEntry(): Promise<EntryDocument | null> {
  const query = `*[_type == "entry" && status == "active" && mode == "auto"][0]`;
  return serverClient.fetch(query);
}

export async function getLatestOutsideEntry(): Promise<EntryDocument | null> {
  const query = `*[_type == "entry" && location == "outside"] | order(startTime desc) [0]`;
  return serverClient.fetch(query);
}

export async function getAllCompletedEntries(): Promise<EntryDocument[]> {
  const query = `*[_type == "entry" && status == "completed"] | order(startTime desc)`;
  return serverClient.fetch(query);
}

export async function getAllEntriesThisWeek(): Promise<EntryDocument[]> {
  const query = `*[_type == "entry" && status == "completed" && startTime > $weekAgo] | order(startTime desc)`;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return serverClient.fetch(query, { weekAgo });
}

export async function addManualEntry(entry: ManualEntry) {
  const validatedEntry = ManualEntry.safeParse(entry);
  if (!validatedEntry.success) {
    throw new Error("Invalid entry data");
  }

  const newDocument: EntryDocument = {
    _id: randomUUID(),
    _type: "entry",
    startTime: new Date().toISOString(),
    status: "completed",
    mode: "manual",
    ...validatedEntry.data,
  };

  await serverClient.create(newDocument);
  revalidatePaths();
}

export async function startEntry() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const newDocument: EntryDocument = {
    _id: randomUUID(),
    _type: "entry",
    startTime: new Date().toISOString(),
    status: "active",
    mode: "auto",
    location: "outside",
    user: session?.user,
  };

  await serverClient.create(newDocument);
  revalidatePaths();
  return newDocument;
}

export async function updateEntry(entryId: string, entry: AutoEntry) {
  const validatedEntry = AutoEntry.safeParse(entry);
  if (!validatedEntry.success) {
    throw new Error("Invalid entry data");
  }

  const existingEntry = await serverClient.getDocument<EntryDocument>(entryId);
  if (!existingEntry) {
    throw new Error("Entry not found");
  }

  const updatedEntry: EntryDocument = {
    ...existingEntry,
    ...validatedEntry.data,
    status: "completed",
  };

  await serverClient.createOrReplace(updatedEntry);
  revalidatePaths();
}

export async function deleteEntry(entryId: string) {
  await serverClient.delete(entryId);
  revalidatePaths();
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/stats");
}
