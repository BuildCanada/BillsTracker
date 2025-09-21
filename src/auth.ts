import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { env, assertServerEnv } from "@/env";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { isInitiallyAllowed } from "@/lib/auth/allowed-users";

if (env.NODE_ENV !== "production") {
  try { assertServerEnv(); } catch (e) { console.warn("[auth] env check:", e); }
  if (!env.NEXTAUTH_URL) console.warn("[auth] Missing NEXTAUTH_URL (e.g. http://localhost:3000 in dev).");
}

// Set NEXTAUTH_URL from NEXT_PUBLIC_APP_URL if not explicitly provided
if (!process.env.NEXTAUTH_URL && env.NEXT_PUBLIC_APP_URL) {
  try {
    process.env.NEXTAUTH_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  } catch (e) {
    if (env.NODE_ENV !== "production") {
      console.warn("[auth] Failed to set NEXTAUTH_URL from NEXT_PUBLIC_APP_URL:", e);
    }
  }
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
  logger: {
    error(code, metadata) {
      console.error("[NextAuth Error]", code, metadata);
    },
    warn(code) {
      console.warn("[NextAuth Warning]", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth Debug]", code, metadata);
      }
    },
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      const email = user?.email?.trim().toLowerCase();
      if (!email) {
        console.warn("[auth] No email provided by OAuth provider");
        return false;
      }

      console.log(`[auth] Sign-in attempt for ${email}`);

      // Check database for user approval (both dev and production)
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        );

        const dbPromise = (async () => {
          await connectToDatabase();
          const existing = await User.findOne({ emailLower: email });
          return existing;
        })();

        const existing = await Promise.race([dbPromise, timeoutPromise]) as any;

        if (!existing) {
          console.warn(`[auth] User ${email} not found in database`);
          return "/sign-in?error=AccessDenied";
        }

        if (!existing.allowed) {
          console.warn(`[auth] User ${email} not allowed`);
          return "/sign-in?error=AccessDenied";
        }

        console.log(`[auth] User ${email} approved and signed in`);

        // Update user in background
        setImmediate(async () => {
          try {
            existing.name = user?.name ?? existing.name;
            (existing as any).image = (user as any)?.image ?? existing.image;
            existing.lastLoginAt = new Date();
            await existing.save();
          } catch (err) {
            console.warn("[auth] Failed to update user:", err);
          }
        });

        return true;
      } catch (err) {
        console.error("[auth] DB check failed:", err);
        return "/sign-in?error=Configuration";
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
    signIn: "/sign-in",
  },
  secret: env.NEXTAUTH_SECRET || env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


