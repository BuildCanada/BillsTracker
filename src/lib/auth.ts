import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { env } from "@/env";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow sign-in if email is provided
      if (!user.email) {
        return false;
      }

      try {
        await connectToDatabase();

        // Check if user exists in our database
        const existingUser = await User.findOne({
          emailLower: user.email.toLowerCase(),
        });

        if (existingUser) {
          // Only allow sign-in if the user is approved
          return existingUser.allowed === true;
        }

        return false;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async session({ session }) {
      // Add user ID to session if needed
      if (session.user?.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({
            emailLower: session.user.email.toLowerCase(),
          });
          if (dbUser) {
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).allowed = dbUser.allowed;
          }
        } catch (error) {
          console.error("Error fetching user from DB:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
