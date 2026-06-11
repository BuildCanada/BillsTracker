import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill, type BillDocument } from "@/models/Bill";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth";
import {
  fetchBillMarkdown,
  getBillFromCivicsProjectApi,
  summarizeBillText,
} from "@/services/billApi";

/**
 * Admin-only endpoint to re-run the AI analysis for a bill.
 *
 * Pulls the latest bill text (preferring the freshest source from the Civics
 * Project API, falling back to the source already stored on the bill), feeds it
 * through `summarizeBillText`, and overwrites the AI-generated fields in the DB.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Verify user is on the allowlist; do not create
  const dbUser = await User.findOne({
    emailLower: session.user.email.toLowerCase(),
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = (await Bill.findOne({ billId: id })
    .lean()
    .exec()) as BillDocument | null;
  if (!existing) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  // Prefer the freshest source from the Civics Project API; fall back to the
  // source stored on the existing bill.
  let source: string | undefined = existing.source;
  try {
    const apiBill = await getBillFromCivicsProjectApi(id);
    const apiSource =
      apiBill?.source ||
      (apiBill?.billTexts?.[0] as { url?: string } | undefined)?.url;
    if (apiSource) {
      source = apiSource;
    }
  } catch (error) {
    console.error(`Reprocess ${id}: failed to fetch latest source`, error);
  }

  if (!source) {
    return NextResponse.json(
      { error: "No bill text source available to reprocess" },
      { status: 422 },
    );
  }

  const markdown = await fetchBillMarkdown(source);
  if (!markdown) {
    return NextResponse.json(
      { error: "Failed to fetch bill text from source" },
      { status: 502 },
    );
  }

  const analysis = await summarizeBillText(markdown);

  await Bill.updateOne(
    { billId: id },
    {
      $set: {
        summary: analysis.summary,
        short_title: analysis.short_title ?? existing.short_title,
        tenet_evaluations: analysis.tenet_evaluations,
        final_judgment: analysis.final_judgment,
        rationale: analysis.rationale,
        needs_more_info: analysis.needs_more_info,
        missing_details: analysis.missing_details,
        steel_man: analysis.steel_man,
        question_period_questions: analysis.question_period_questions ?? [],
        source,
        lastUpdatedOn: new Date(),
      },
    },
    { upsert: false },
  );

  return NextResponse.json({ ok: true });
}
