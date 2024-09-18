import { defineType, defineField } from "sanity";

/**
 * This should be identical to the ZOD schema for the user document
 * @see /types/user.ts
 */
export const user = defineType({
  type: "object",
  name: "user",
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "email",
      type: "string",
    }),
    defineField({
      name: "image",
      type: "url",
    }),
  ],
});
