import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Twitch from "next-auth/providers/twitch";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Plan, UserRole } from "@prisma/client";

import { env, isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const providers = isDemoMode
  ? [
      Credentials({
        id: "demo",
        name: "Demo",
        credentials: {},
        async authorize() {
          const user = await prisma.user.findFirst({
            where: { email: "demo@autoclip.local" }
          });

          return user;
        }
      })
    ]
  : [
      Twitch({
        clientId: env.AUTH_TWITCH_ID!,
        clientSecret: env.AUTH_TWITCH_SECRET!,
        authorization: {
          params: {
            scope: "openid user:read:email clips:edit chat:read"
          }
        }
      })
    ];

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: isDemoMode ? "jwt" : "database"
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.plan = user.plan;
        token.twitchLogin = user.twitchLogin;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = user?.id ?? String(token.id);
        session.user.role = user?.role ?? token.role ?? UserRole.USER;
        session.user.plan = user?.plan ?? token.plan ?? Plan.FREE;
        session.user.twitchLogin = user?.twitchLogin ?? token.twitchLogin;
      }

      return session;
    },
    async signIn({ account, profile, user }) {
      if (account?.provider !== "twitch" || !profile?.sub) {
        return true;
      }

      if (!user.id) {
        return true;
      }

      try {
        const twitchProfile = profile as {
          sub: string;
          preferred_username?: string;
          name?: string;
        };

        await prisma.user.update({
          where: { id: user.id },
          data: {
            twitchUserId: twitchProfile.sub,
            twitchLogin: twitchProfile.preferred_username,
            twitchName: twitchProfile.name
          }
        });

        await prisma.clipRule.upsert({
          where: { id: `default-${user.id}` },
          create: {
            id: `default-${user.id}`,
            userId: user.id,
            command: "!clip",
            cooldownSeconds: 60
          },
          update: {}
        });
      } catch (error) {
        console.error("Twitch sign-in post-processing failed", error);
      }

      return true;
    }
  },
  pages: {
    signIn: "/login"
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
