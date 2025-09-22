import { NextRequest, NextResponse } from "next/server";
// @TODO: Do we need to use getServerSession?
// import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ email: string }> },
) {
  const session = { user: { email: null } };
  // Simple gate: only signed-in users can allow others (adjust as needed)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectToDatabase();
  const { email } = await context.params;
  const emailLower = decodeURIComponent(email).trim().toLowerCase();
  const updated = await User.findOneAndUpdate(
    { emailLower },
    { $set: { allowed: true } },
    { new: true },
  );
  return NextResponse.json({ ok: true, user: updated });
}
