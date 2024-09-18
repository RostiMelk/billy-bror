import { z } from "zod";

export const User = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export type User = z.infer<typeof User>;
