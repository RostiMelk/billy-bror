import { getActiveEntry, revalidatePaths } from "@/lib/actions";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import type { EntryDocument } from "@/types/entry";
import { serverClient } from "@/lib/server-client";

const requestSchema = z.object({
  hash: z.string(),
});

export async function POST(request: Request) {
  const { hash } = requestSchema.parse(await request.json());

  const user = await serverClient.fetch(`*[_type == "user" && _id == $hash]`, {
    hash,
  });
  if (!user) {
    return Response.json({ message: "Error: User not found" });
  }

  const activeEntry = await getActiveEntry();
  if (activeEntry) {
    return Response.json({ message: "There is already an ongoing walk" });
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
  return Response.json({ message: "All done, have a good walk!" });
}
