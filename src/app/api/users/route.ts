import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

type CreateUserPayload = {
  email: string;
  name?: string | null;
  image?: string | null;
  allowed?: boolean;
};

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() || "";
  let body: Partial<CreateUserPayload> = {};
  if (contentType.includes("application/json")) {
    body = (await request.json()) as Partial<CreateUserPayload>;
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(await request.text());
    body = {
      email: params.get("email") || undefined,
      name: params.get("name") || undefined,
      image: params.get("image") || undefined,
      allowed: params.get("allowed") === "true" ? true : params.get("allowed") === "false" ? false : undefined,
    };
  } else {
    try {
      const form: any = await (request as any).formData?.();
      body = {
        email: (form?.get?.("email") as string | null) || undefined,
        name: (form?.get?.("name") as string | null) || undefined,
        image: (form?.get?.("image") as string | null) || undefined,
        allowed: ((form?.get?.("allowed") as string | null) || "").toString() === "true" ? true : undefined,
      };
    } catch {
      // no-op; will fail on validation below
    }
  }

  const emailLower = normalizeEmail(body.email);
  if (!emailLower) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ emailLower });
  if (existing) {
    // Update only provided fields for idempotency
    if (typeof body.name !== "undefined") existing.name = body.name;
    if (typeof body.image !== "undefined") (existing as any).image = body.image;
    if (typeof body.allowed !== "undefined") existing.allowed = !!body.allowed;
    await existing.save();
    return NextResponse.json({ ok: true, user: existing, created: false });
  }

  const created = await User.create({
    email: body.email,
    emailLower,
    name: body.name ?? null,
    image: body.image ?? null,
    allowed: !!body.allowed,
    lastLoginAt: undefined,
  });

  return NextResponse.json({ ok: true, user: created, created: true });
}


