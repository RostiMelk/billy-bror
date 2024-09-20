import {
  defineMigration,
  at,
  setIfMissing,
  append,
  unset,
} from "sanity/migrate";

export default defineMigration({
  title: "Convert single user to multi user",
  documentTypes: ["entry"],
  filter: "defined(user) && !defined(users)",
  migrate: {
    document(entry) {
      return [
        at("users", setIfMissing([])),
        at("users", append(entry.user)),
        at("user", unset()),
      ];
    },
  },
});
