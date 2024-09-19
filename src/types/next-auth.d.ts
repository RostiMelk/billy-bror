import "next-auth";

/**
 * We only allow Google sign-in for users,
 * and Google requires an email address and name.
 */
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  }
}

declare module "next-auth" {
  interface Session {
    user?: User;
  }
}
