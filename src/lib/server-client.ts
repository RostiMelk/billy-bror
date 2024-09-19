import "server-only";
import { createClient } from "@sanity/client";

export const serverClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.NEXT_PRIVATE_SANITY_TOKEN,
  apiVersion: "vX",
  useCdn: false,
});
