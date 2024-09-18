import { z } from "zod";

export const Status = z.enum(["active", "completed"]);
export const Mode = z.enum(["auto", "manual"]);
export const Location = z.enum(["inside", "outside"]);

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
});

export const AutoEntry = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: Location.optional(),
  poops: z.number(),
  pees: z.number(),
});

export const ManualEntry = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: Location,
  poops: z.number(),
  pees: z.number(),
});

export type Status = z.infer<typeof Status>;
export type Mode = z.infer<typeof Mode>;
export type Location = z.infer<typeof Location>;
export type EntryDocument = z.infer<typeof EntryDocument>;
export type AutoEntry = z.infer<typeof AutoEntry>;
export type ManualEntry = z.infer<typeof ManualEntry>;
