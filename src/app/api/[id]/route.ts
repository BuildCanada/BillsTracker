import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill } from "@/models/Bill";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = { user: { email: null } };
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  let title: string | undefined;
  let short_title: string | undefined;
  let summary: string | undefined;
  let final_judgment: string | undefined;
  let rationale: string | undefined;
  let steel_man: string | undefined;
  let missing_details_raw = "";
  let genres_raw = "";
  let question_period_questions_raw = "";
  let tenet_ids: string[] = [];
  let tenet_titles: string[] = [];
  let tenet_alignments: string[] = [];
  let tenet_explanations: string[] = [];

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    title = params.get("title") || undefined;
    short_title = params.get("short_title") || undefined;
    summary = params.get("summary") || undefined;
    final_judgment = params.get("final_judgment") || undefined;
    rationale = params.get("rationale") || undefined;
    steel_man = params.get("steel_man") || undefined;
    missing_details_raw = params.get("missing_details") || "";
    genres_raw = params.get("genres") || "";
    question_period_questions_raw = params.get("question_period_questions") || "";
    tenet_ids = params.getAll("tenet_id");
    tenet_titles = params.getAll("tenet_title");
    tenet_alignments = params.getAll("tenet_alignment");
    tenet_explanations = params.getAll("tenet_explanation");
  } else if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    const asString = (v: unknown): string | undefined =>
      typeof v === "string" ? v : v == null ? undefined : String(v);
    title = asString(json.title);
    short_title = asString(json.short_title);
    summary = asString(json.summary);
    final_judgment = asString(json.final_judgment);
    rationale = asString(json.rationale);
    steel_man = asString(json.steel_man);
    missing_details_raw = asString(json.missing_details) || "";
    genres_raw = asString(json.genres) || "";
    question_period_questions_raw = asString(json.question_period_questions) || "";
    tenet_ids = Array.isArray((json as any).tenet_id) ? ((json as any).tenet_id as unknown[]).map(String) : [];
    tenet_titles = Array.isArray((json as any).tenet_title) ? ((json as any).tenet_title as unknown[]).map(String) : [];
    tenet_alignments = Array.isArray((json as any).tenet_alignment) ? ((json as any).tenet_alignment as unknown[]).map(String) : [];
    tenet_explanations = Array.isArray((json as any).tenet_explanation) ? ((json as any).tenet_explanation as unknown[]).map(String) : [];
  } else {
    // Fallback: try formData if available at runtime
    try {
      const form: any = await (request as any).formData();
      title = (form.get("title") as string | null) || undefined;
      short_title = (form.get("short_title") as string | null) || undefined;
      summary = (form.get("summary") as string | null) || undefined;
      final_judgment = (form.get("final_judgment") as string | null) || undefined;
      rationale = (form.get("rationale") as string | null) || undefined;
      steel_man = (form.get("steel_man") as string | null) || undefined;
      missing_details_raw = (form.get("missing_details") as string | null) || "";
      genres_raw = (form.get("genres") as string | null) || "";
      question_period_questions_raw = (form.get("question_period_questions") as string | null) || "";
      tenet_ids = (form.getAll as any)("tenet_id").map(String);
      tenet_titles = (form.getAll as any)("tenet_title").map(String);
      tenet_alignments = (form.getAll as any)("tenet_alignment").map(String);
      tenet_explanations = (form.getAll as any)("tenet_explanation").map(String);
    } catch {
      // no-op
    }
  }

  const missing_details = missing_details_raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const genres = genres_raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const question_period_questions = question_period_questions_raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((question) => ({ question }));

  const update: Record<string, unknown> = {
    lastUpdatedOn: new Date(),
  };
  if (title !== undefined) update.title = title;
  if (short_title !== undefined) update.short_title = short_title;
  if (summary !== undefined) update.summary = summary;
  if (final_judgment !== undefined) update.final_judgment = final_judgment;
  if (rationale !== undefined) update.rationale = rationale;
  if (steel_man !== undefined) update.steel_man = steel_man;
  update.missing_details = missing_details;
  update.genres = genres;
  update.question_period_questions = question_period_questions;
  const tenet_evaluations = tenet_titles.map((title, idx) => ({
    id: Number(tenet_ids[idx] ?? idx + 1),
    title,
    alignment: (tenet_alignments[idx] as any) || "neutral",
    explanation: tenet_explanations[idx] || "",
  }));
  if (tenet_evaluations.length) {
    update.tenet_evaluations = tenet_evaluations;
  }
  const id = (await params).id;

  await Bill.updateOne({ billId: id }, { $set: update }, { upsert: false });

  return NextResponse.redirect(new URL(`/bills/${id}`, request.url));
}


