import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill, type BillDocument } from "@/models/Bill";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth";
import {
  type ApiBillDetail,
  fetchBillMarkdown,
  getBillFromCivicsProjectApi,
  summarizeBillText,
} from "@/services/billApi";

/**
 * Admin-only endpoint to refetch a bill from the Civics Project API and re-run
 * its AI analysis.
 *
 * Fetches the latest bill record from the Civics Project API, refreshes the
 * stored metadata (title, status, stages, sponsor, genres, source, …), then
 * pulls the latest bill text, feeds it through `summarizeBillText`, and
 * overwrites the AI-generated fields in the DB.
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

  // Refetch the latest bill record from the Civics Project API.
  let apiBill: ApiBillDetail | null = null;
  try {
    apiBill = await getBillFromCivicsProjectApi(id);
  } catch (error) {
    console.error(
      `Reprocess ${id}: failed to fetch from Civics Project`,
      error,
    );
    return NextResponse.json(
      { error: "Failed to fetch latest bill data from Civics Project API" },
      { status: 502 },
    );
  }
  if (!apiBill) {
    return NextResponse.json(
      { error: "Bill not found in Civics Project API" },
      { status: 404 },
    );
  }

  // Resolve the latest bill text source from the API, falling back to stored.
  const source =
    apiBill.source ||
    (apiBill.billTexts?.[0] as { url?: string } | undefined)?.url ||
    existing.source;
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

  const latestStageDate =
    apiBill.stages && apiBill.stages.length > 0
      ? apiBill.stages[apiBill.stages.length - 1].date
      : (apiBill.updatedAt ?? apiBill.date);

  await Bill.updateOne(
    { billId: id },
    {
      $set: {
        // Refreshed metadata from the Civics Project API
        title: apiBill.title,
        status: apiBill.status,
        sponsorParty: apiBill.sponsorParty,
        genres: apiBill.genres,
        supportedRegion: apiBill.supportedRegion,
        stages: apiBill.stages?.map((stage) => ({
          stage: stage.stage,
          state: stage.state,
          house: stage.house,
          date: new Date(stage.date),
        })),
        billTextsCount: Array.isArray(apiBill.billTexts)
          ? apiBill.billTexts.length
          : 0,
        source,
        // Regenerated AI analysis
        summary: analysis.summary,
        short_title:
          apiBill.shortTitle ?? analysis.short_title ?? existing.short_title,
        tenet_evaluations: analysis.tenet_evaluations,
        final_judgment: analysis.final_judgment,
        rationale: analysis.rationale,
        needs_more_info: analysis.needs_more_info,
        missing_details: analysis.missing_details,
        steel_man: analysis.steel_man,
        question_period_questions: analysis.question_period_questions ?? [],
        lastUpdatedOn: new Date(latestStageDate),
      },
    },
    { upsert: false },
  );

  return NextResponse.json({ ok: true });
}
