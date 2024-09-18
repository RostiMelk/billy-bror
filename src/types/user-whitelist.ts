import { z } from "zod";

export const UserWhitelist = z.object({
  _id: z.string(),
  _type: z.literal("userWhitelist"),
  email: z.string(),
});

export type UserWhitelist = z.infer<typeof UserWhitelist>;
