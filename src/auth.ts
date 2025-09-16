import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { isEmailAllowed } from "@/lib/auth/allowed-users";
import { env, assertServerEnv } from "@/env";

if (env.NODE_ENV !== "production") {
  try { assertServerEnv(); } catch (e) { console.warn("[auth] env check:", e); }
  if (!env.NEXTAUTH_URL) console.warn("[auth] Missing NEXTAUTH_URL (e.g. http://localhost:3000 in dev).");
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
      return isEmailAllowed(user?.email);
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


