import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { env, assertServerEnv } from "@/env";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { BASE_PATH } from "@/utils/basePath";

if (env.NODE_ENV !== "production") {
  try {
    assertServerEnv();
  } catch (e) {
    console.warn("[auth] env check:", e);
  }
  if (!env.NEXTAUTH_URL)
    console.warn(
      "[auth] Missing NEXTAUTH_URL (e.g. http://localhost:3000 in dev).",
    );
}

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: { scope: "openid email profile", prompt: "consent" },
      },
    }),
  ],
  debug: process.env.NODE_ENV !== "production",
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      const email = user?.email?.trim().toLowerCase();
      if (!email) return false;

      // Prefer DB-backed allowlist. Fall back to stub if DB not configured.
      try {
        await connectToDatabase();
        const now = new Date();
        const existing = await User.findOne({ emailLower: email });
        if (!existing) {
          // DEV ONLY: auto-create + allow any signed-in account so every user
          // has admin access locally. Never runs in production.
          if (env.NODE_ENV !== "production") {
            console.warn(
              `[auth] DEV: auto-creating + allowing ${email} (admin access on for all users).`,
            );
            await User.create({
              email: user?.email,
              emailLower: email,
              name: user?.name ?? null,
              allowed: true,
              lastLoginAt: now,
            });
            return true;
          }
          return false;
        }
        existing.name = user?.name ?? existing.name;
        (existing as any).image = (user as any)?.image ?? existing.image;
        existing.lastLoginAt = now;
        await existing.save();
        // DEV ONLY: allow regardless of the allowlist flag.
        if (env.NODE_ENV !== "production") return true;
        return !!existing.allowed;
      } catch (err) {
        if (env.NODE_ENV !== "production") {
          console.warn("[auth] DB check failed, denying sign-in:", err);
        }
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name;
        token.picture = (user as any)?.image as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.email = token.email as string | undefined;
        session.user.name = token.name as string | undefined;
        (session.user as any).image = token.picture as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: `${BASE_PATH}/sign-in`,
  },
  secret: env.NEXTAUTH_SECRET || env.AUTH_SECRET,
};
