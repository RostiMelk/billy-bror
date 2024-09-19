import { z } from "zod";

export const User = z.object({
  name: z.string(),
  email: z.string().email(),
  image: z.string().url().optional().nullable(),
});

export type User = z.infer<typeof User>;
