import { defineType, defineField } from "sanity";

/**
 * This should be identical to the ZOD schema for the entry document
 * @see /types/entry.ts
 */
export const entry = defineType({
  type: "document",
  name: "entry",
  fields: [
    defineField({
      name: "startTime",
      type: "datetime",
    }),
    defineField({
      name: "endTime",
      type: "datetime",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: ["active", "completed", "cancelled"],
      },
    }),
    defineField({
      name: "mode",
      type: "string",
      options: {
        list: ["walk", "play", "training"],
      },
    }),
    defineField({
      name: "location",
      type: "string",
      options: {
        list: ["indoor", "outdoor"],
      },
    }),
    defineField({
      name: "poops",
      type: "number",
    }),
    defineField({
      name: "pees",
      type: "number",
    }),
    defineField({
      name: "user",
      type: "user",
    }),
  ],
  preview: {
    select: {
      title: "mode",
      subtitle: "status",
      startTime: "startTime",
    },
    prepare(selection) {
      const { title, subtitle, startTime } = selection;
      return {
        title: `${title} - ${new Date(startTime).toLocaleString()}`,
        subtitle,
      };
    },
  },
});
