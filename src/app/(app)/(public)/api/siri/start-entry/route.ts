import { getActiveEntry, revalidatePaths } from "@/lib/actions";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { EntryDocument } from "@/types/entry";
import { serverClient } from "@/lib/server-client";

const requestSchema = z.object({
  hash: z.string(),
});

const responseSchema = z.object({
  message: z.string(),
});

export async function POST(request: Request) {
  const { hash } = requestSchema.parse(request.body);

  const user = await serverClient.fetch(`*[_type == "user" && _id == $hash]`, {
    hash,
  });
  if (!user) {
    return responseSchema.parse({ message: "User not found" });
  }

  const activeEntry = await getActiveEntry();
  if (activeEntry) {
    return responseSchema.parse({
      message: "There is already an ongoing trip",
    });
  }

  const userRef = {
    _type: "reference",
    _ref: hash,
  } as const;

  const _id = randomUUID();
  const newDocument: EntryDocument = {
    _id,
    _type: "entry",
    startTime: new Date().toISOString(),
    status: "active",
    mode: "auto",
    location: "outside",
    users: [userRef],
  };

  await serverClient.create(newDocument, { autoGenerateArrayKeys: true });

  revalidatePaths();
  return responseSchema.parse({ message: "Trip started" });
}
