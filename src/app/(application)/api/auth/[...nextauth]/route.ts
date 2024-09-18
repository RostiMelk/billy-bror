import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { UserWhitelist } from "@/types/user-whitelist";
import { client } from "@/lib/sanity";

const USER_WHITELIST_QUERY = `*[_type == "userWhitelist" && email == $email][0]`;

const isUserWhitelisted = async (email: string): Promise<boolean> => {
  const res = await client.fetch<UserWhitelist | null>(USER_WHITELIST_QUERY, {
    email,
  });
  return Boolean(res);
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PRIVATE_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PRIVATE_GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        return await isUserWhitelisted(user.email);
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
