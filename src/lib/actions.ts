"use server";

import { serverClient } from "@/lib/server-client";
import {
  type EntryDocument,
  AutoEntry,
  ManualEntry,
  ResolvedEntryDocument,
} from "@/types/entry";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import groq from "groq";
import { hashEmail } from "./utils";

const ENTRY_PROJECTION = groq`{ ..., user-> }`;

async function getUserRef(): Promise<EntryDocument["user"]> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }
  return {
    _type: "reference",
    _ref: hashEmail(session.user.email),
  };
}

export async function getActiveEntry(): Promise<ResolvedEntryDocument | null> {
  const query = groq`*[_type == "entry" && status == "active" && mode == "auto"][0] ${ENTRY_PROJECTION}`;
  return serverClient.fetch(query);
}

export async function getLatestOutsideEntry(): Promise<ResolvedEntryDocument | null> {
  const query = groq`*[_type == "entry" && location == "outside"] | order(startTime desc) [0] ${ENTRY_PROJECTION}`;
  return serverClient.fetch(query);
}

export async function getAllCompletedEntries(): Promise<
  ResolvedEntryDocument[]
> {
  const query = groq`*[_type == "entry" && status == "completed"] | order(startTime desc) ${ENTRY_PROJECTION}`;
  return serverClient.fetch(query);
}

export async function getAllEntriesThisWeek(): Promise<
  ResolvedEntryDocument[]
> {
  const query = groq`*[_type == "entry" && status == "completed" && startTime > $weekAgo] | order(startTime desc) ${ENTRY_PROJECTION}`;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return serverClient.fetch(query, { weekAgo });
}

export async function addManualEntry(entry: ManualEntry) {
  const validatedEntry = ManualEntry.safeParse(entry);
  if (!validatedEntry.success) {
    throw new Error("Invalid entry data");
  }

  const userRef = await getUserRef();

  const newDocument: EntryDocument = {
    _id: randomUUID(),
    _type: "entry",
    startTime: new Date().toISOString(),
    status: "completed",
    mode: "manual",
    user: userRef,
    ...validatedEntry.data,
  };

  await serverClient.create(newDocument);
  revalidatePaths();
}

export async function startEntry() {
  const userRef = await getUserRef();

  const newDocument: EntryDocument = {
    _id: randomUUID(),
    _type: "entry",
    startTime: new Date().toISOString(),
    status: "active",
    mode: "auto",
    location: "outside",
    user: userRef,
  };

  await serverClient.create(newDocument);
  revalidatePaths();
  return newDocument;
}

export async function updateEntry(entryId: string, entry: AutoEntry) {
  await getUserRef();

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
  await getUserRef();
  await serverClient.delete(entryId);
  revalidatePaths();
}

function revalidatePaths() {
  revalidatePath("/");
  revalidatePath("/stats");
}
