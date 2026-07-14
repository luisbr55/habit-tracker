import NextAuth from "next-auth";

import authConfig from "./auth.config";

import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "@/db";
import { users, accounts } from "@/db/schema";

import { eq } from "drizzle-orm";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
  }) as any,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        await db
          .update(users)
          .set({
            emailVerified: new Date(),
          })
          .where(eq(users.id, user.id));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        const [dbUser] = await db
          .select({
            emailVerified: users.emailVerified,
          })
          .from(users)
          .where(eq(users.id, user.id as string))
          .limit(1);

        token.emailVerified = dbUser?.emailVerified ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        (session.user as any).emailVerified =
          token.emailVerified ?? null;
      }

      return session;
    },
  },

  ...authConfig,
});