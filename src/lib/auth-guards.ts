import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { env } from "@/env";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

/**
 * DEV ONLY: when true, admin/edit access is open to everyone — including users
 * who are not signed in. Never enabled in production.
 */
export const DEV_OPEN_ACCESS = env.NODE_ENV !== "production";

/**
 * Server-side authentication guard that requires a valid authenticated user.
 * Redirects to /unauthorized if:
 * - No session exists
 * - User email is not provided
 * - User does not exist in the database
 *
 * @returns Object containing the session and database user
 * @throws Redirects to /unauthorized if authentication fails
 */
export async function requireAuthenticatedUser() {
  // DEV ONLY: open access — skip the session/allowlist checks entirely.
  if (DEV_OPEN_ACCESS) {
    return { session: null, dbUser: null };
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/unauthorized");
  }

  // Verify the signed-in user exists in DB; do not create
  await connectToDatabase();
  const dbUser = await User.findOne({
    emailLower: session.user.email.toLowerCase(),
  });

  if (!dbUser) {
    redirect("/unauthorized");
  }

  return { session, dbUser };
}
