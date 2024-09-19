import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { serverClient } from "@/lib/server-client";
import type { UserWhitelist } from "@/types/user-whitelist";
import type { User } from "@/types/user";
import { hashEmail } from "@/lib/utils";

const USER_WHITELIST_QUERY = `*[_type == "userWhitelist" && email == $email][0]`;

const isUserWhitelisted = async (email: string): Promise<boolean> => {
  const res = await serverClient.fetch<UserWhitelist | null>(
    USER_WHITELIST_QUERY,
    { email },
  );
  return Boolean(res);
};

const updateUser = async (user: User) => {
  await serverClient.createOrReplace({
    _id: hashEmail(user.email),
    _type: "user",
    email: user.email,
    name: user.name,
    image: user.image,
  });
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
        const isWhitelisted = await isUserWhitelisted(user.email);
        if (isWhitelisted) {
          await updateUser(user);
          return true;
        }
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
