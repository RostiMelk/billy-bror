import { z } from "zod";

export const User = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export type User = z.infer<typeof User>;
