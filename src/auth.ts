import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { env, assertServerEnv } from "@/env";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

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

      // In development, allow all sign-ins to avoid blocking
      if (env.NODE_ENV !== "production") {
        console.log(`[auth] Development mode - allowing ${email}`);

        // Try to update DB in background, but don't block on it
        setImmediate(async () => {
          try {
            await connectToDatabase();
            const now = new Date();
            const existing = await User.findOne({ emailLower: email });

            if (!existing) {
              await User.create({
                email: user.email,
                emailLower: email,
                name: user.name,
                image: (user as any)?.image,
                allowed: true,
                lastLoginAt: now,
              });
              console.log(`[auth] Created user ${email} in background`);
            } else {
              existing.name = user?.name ?? existing.name;
              (existing as any).image = (user as any)?.image ?? existing.image;
              existing.lastLoginAt = now;
              await existing.save();
              console.log(`[auth] Updated user ${email} in background`);
            }
          } catch (err) {
            console.warn("[auth] Background DB operation failed:", err);
          }
        });

        return true;
      }

      // Production mode - check database with timeout
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
          console.warn(`[auth] User ${email} not found in production`);
          return "/sign-in?error=AccessDenied";
        }

        if (!existing.allowed) {
          console.warn(`[auth] User ${email} not allowed`);
          return "/sign-in?error=AccessDenied";
        }

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
        console.error("[auth] DB check failed in production:", err);
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


