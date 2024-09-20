import { z } from "zod";
import { User } from "@/types/user";

export const Status = z.enum(["active", "completed"]);
export const Mode = z.enum(["auto", "manual"]);
export const Location = z.enum(["inside", "outside"]);

export const UserReference = z.object({
  _type: z.literal("reference"),
  _ref: z.string(),
});

export const EntryDocument = z.object({
  _id: z.string(),
  _type: z.literal("entry"),
  startTime: z.string(),
  endTime: z.string().optional(),
  status: Status,
  mode: Mode,
  location: Location,
  poops: z.number().optional(),
  pees: z.number().optional(),
  users: z.array(UserReference).optional(),
  likes: z.array(UserReference).optional(),
});

export const ResolvedEntryDocument = EntryDocument.merge(
  z.object({
    users: z.array(User).optional(),
    likes: z.array(User).optional(),
  }),
);

export const AutoEntry = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: Location.optional(),
  poops: z.number(),
  pees: z.number(),
  users: z.array(UserReference).optional(),
});

export const ManualEntry = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: Location,
  poops: z.number(),
  pees: z.number(),
  users: z.array(UserReference).optional(),
});

export type UserReference = z.infer<typeof UserReference>;
export type Status = z.infer<typeof Status>;
export type Mode = z.infer<typeof Mode>;
export type Location = z.infer<typeof Location>;
export type EntryDocument = z.infer<typeof EntryDocument>;
export type ResolvedEntryDocument = z.infer<typeof ResolvedEntryDocument>;
export type AutoEntry = z.infer<typeof AutoEntry>;
export type ManualEntry = z.infer<typeof ManualEntry>;
