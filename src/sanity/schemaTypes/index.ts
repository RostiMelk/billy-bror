import type { SchemaTypeDefinition } from "sanity";
import { user } from "@/sanity/schemaTypes/user";
import { entry } from "@/sanity/schemaTypes/entry";
import { userWhitelist } from "@/sanity/schemaTypes/user-whitelist";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, entry, userWhitelist],
};
