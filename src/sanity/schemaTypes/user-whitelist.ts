import { defineType, defineField } from "sanity";

export const userWhitelist = defineType({
  type: "document",
  name: "userWhitelist",
  fields: [
    defineField({
      name: "email",
      type: "string",
    }),
  ],
});
