"use server";

import { serverClient } from "@/lib/server-client";
import {
  AutoEntry,
  ManualEntry,
  type UserReference,
  type EntryDocument,
  type ResolvedEntryDocument,
} from "@/types/entry";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import groq from "groq";
import { userToReference } from "./utils";

const ENTRY_PROJECTION = groq`{ ..., users[]->, likes[]-> }`;

async function getUserRef(): Promise<UserReference> {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("User not authenticated");
  }
  return userToReference(session.user);
}

export async function getActiveEntry(): Promise<ResolvedEntryDocument | null> {
  const query = groq`*[_type == "entry" && status == "active" && mode == "auto"][0] ${ENTRY_PROJECTION}`;
  return serverClient.fetch(query);
}

export async function getLatestOutsideEntry(): Promise<ResolvedEntryDocument | null> {
  const query = groq`*[_type == "entry" && location == "outside"] | order(coalesce(endTime, startTime) desc) [0] ${ENTRY_PROJECTION}`;
  return serverClient.fetch(query);
}

export async function getAllCompletedEntries(): Promise<
  ResolvedEntryDocument[]
> {
  const query = groq`*[_type == "entry" && status == "completed"] | order(coalesce(endTime, startTime) desc) ${ENTRY_PROJECTION}`;
  return serverClient.fetch(query);
}

export async function getAllEntriesThisWeek(): Promise<
  ResolvedEntryDocument[]
> {
  const query = groq`*[_type == "entry" && status == "completed" && startTime > $weekAgo] | order(coalesce(endTime, startTime) desc) ${ENTRY_PROJECTION}`;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);
  return serverClient.fetch(query, { weekAgo });
}

export async function getStreakCount(): Promise<number> {
  const query = groq`*[_type == "entry" && location == "inside" && status == "completed"] | order(startTime desc) [0].startTime`;
  const firstInsideEntryDate = await serverClient.fetch<string | null>(query);

  if (!firstInsideEntryDate) {
    return 0;
  }

  const firstDate = new Date(firstInsideEntryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - firstDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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
    users: [userRef],
    ...validatedEntry.data,
  };

  await serverClient.create(newDocument, { autoGenerateArrayKeys: true });
  revalidatePaths();
}

export async function startEntry(
  isoStartTime: string,
): Promise<ResolvedEntryDocument> {
  const activeEntry = await getActiveEntry();
  if (activeEntry) {
    throw new Error("An active entry already exists");
  }

  const userRef = await getUserRef();
  const _id = randomUUID();
  const newDocument: EntryDocument = {
    _id,
    _type: "entry",
    startTime: isoStartTime,
    status: "active",
    mode: "auto",
    location: "outside",
    users: [userRef],
  };
  await serverClient.create(newDocument, { autoGenerateArrayKeys: true });
  revalidatePaths();
  return serverClient.fetch<ResolvedEntryDocument>(
    `*[_id == $_id][0] ${ENTRY_PROJECTION}`,
    { _id },
  );
}

export async function updateEntry(entryId: string, entry: AutoEntry) {
  await getUserRef();

  console.log("entryId", entryId, "entry", entry);

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

  await serverClient.createOrReplace(updatedEntry, {
    autoGenerateArrayKeys: true,
  });
  revalidatePaths();
}

export async function deleteEntry(entryId: string) {
  await getUserRef();
  await serverClient.delete(entryId);
  revalidatePaths();
}

export async function likeEntry(entryId: string) {
  const userRef = await getUserRef();

  const existingEntry = await serverClient.getDocument<EntryDocument>(entryId);
  if (!existingEntry) {
    throw new Error("Entry not found");
  }

  const likes = existingEntry.likes || [];
  const userLiked = likes.some((like) => like._ref === userRef?._ref);

  let updatedLikes: EntryDocument["likes"];
  if (userLiked) {
    updatedLikes = likes.filter((like) => like._ref !== userRef?._ref);
  } else {
    updatedLikes = [...likes, userRef];
  }

  const updatedEntry: EntryDocument = {
    ...existingEntry,
    likes: updatedLikes,
  };

  await serverClient.createOrReplace(updatedEntry, {
    autoGenerateArrayKeys: true,
  });
}
export async function appendMyselfToEntry(entryId: string) {
  const userRef = await getUserRef();

  const existingEntry = await serverClient.getDocument<EntryDocument>(entryId);
  if (!existingEntry) {
    throw new Error("Entry not found");
  }

  const isUserAlreadyInEntry = existingEntry?.users?.some(
    (user) => user._ref === userRef._ref,
  );
  if (isUserAlreadyInEntry) {
    throw new Error("User already in entry");
  }

  return serverClient
    .patch(entryId)
    .setIfMissing({ users: [] })
    .append("users", [userRef])
    .commit({ autoGenerateArrayKeys: true });
}

export async function revalidatePaths() {
  await Promise.all([revalidatePath("/"), revalidatePath("/stats")]);
}
