import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Bill } from "@/models/Bill";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth";
import { BASE_PATH } from "@/utils/basePath";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Verify user exists in DB; do not create
  const dbUser = await User.findOne({
    emailLower: session.user.email.toLowerCase(),
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() || "";

  let title: string | undefined;
  let short_title: string | undefined;
  let summary: string | undefined;
  let final_judgment: string | undefined;
  let rationale: string | undefined;
  let steel_man: string | undefined;
  let missing_details_input: unknown;
  let genres_input: unknown;
  let question_period_questions_input: unknown;
  let hasMissingDetails = false;
  let hasGenres = false;
  let hasQuestionPeriodQuestions = false;
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
    if (params.has("missing_details")) {
      hasMissingDetails = true;
      missing_details_input = params.get("missing_details") || "";
    }
    if (params.has("genres")) {
      hasGenres = true;
      genres_input = params.get("genres") || "";
    }
    const questionPeriodValues = params.getAll("question_period_questions");
    if (questionPeriodValues.length > 0) {
      hasQuestionPeriodQuestions = true;
      question_period_questions_input = questionPeriodValues;
    }
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
    if ("missing_details" in json) {
      hasMissingDetails = true;
      missing_details_input = (json as any).missing_details;
    }
    if ("genres" in json) {
      hasGenres = true;
      genres_input = (json as any).genres;
    }
    if ("question_period_questions" in json) {
      hasQuestionPeriodQuestions = true;
      question_period_questions_input = (json as any).question_period_questions;
    }
    tenet_ids = Array.isArray((json as any).tenet_id)
      ? ((json as any).tenet_id as unknown[]).map(String)
      : [];
    tenet_titles = Array.isArray((json as any).tenet_title)
      ? ((json as any).tenet_title as unknown[]).map(String)
      : [];
    tenet_alignments = Array.isArray((json as any).tenet_alignment)
      ? ((json as any).tenet_alignment as unknown[]).map(String)
      : [];
    tenet_explanations = Array.isArray((json as any).tenet_explanation)
      ? ((json as any).tenet_explanation as unknown[]).map(String)
      : [];
  } else {
    // Fallback: try formData if available at runtime
    try {
      const form: any = await (request as any).formData();
      title = (form.get("title") as string | null) || undefined;
      short_title = (form.get("short_title") as string | null) || undefined;
      summary = (form.get("summary") as string | null) || undefined;
      final_judgment =
        (form.get("final_judgment") as string | null) || undefined;
      rationale = (form.get("rationale") as string | null) || undefined;
      steel_man = (form.get("steel_man") as string | null) || undefined;
      if (typeof form.has === "function" && form.has("missing_details")) {
        hasMissingDetails = true;
        missing_details_input =
          (form.get("missing_details") as string | null) || "";
      }
      if (typeof form.has === "function" && form.has("genres")) {
        hasGenres = true;
        genres_input = (form.get("genres") as string | null) || "";
      }
      const questionPeriodValues = (form.getAll as any)(
        "question_period_questions",
      );
      if (
        Array.isArray(questionPeriodValues) &&
        questionPeriodValues.length > 0
      ) {
        hasQuestionPeriodQuestions = true;
        question_period_questions_input = questionPeriodValues;
      }
      tenet_ids = (form.getAll as any)("tenet_id").map(String);
      tenet_titles = (form.getAll as any)("tenet_title").map(String);
      tenet_alignments = (form.getAll as any)("tenet_alignment").map(String);
      tenet_explanations = (form.getAll as any)("tenet_explanation").map(
        String,
      );
    } catch {
      // no-op
    }
  }

  const parseCommaSeparated = (value: unknown): string[] => {
    const segments: string[] = [];
    const addFromString = (input: string) => {
      const newSegments = input
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      segments.push(...newSegments);
    };

    const handle = (input: unknown): void => {
      if (input == null) return;
      if (Array.isArray(input)) {
        input.forEach(handle);
        return;
      }
      if (typeof input === "object") {
        return;
      }
      addFromString(String(input));
    };

    handle(value);
    return segments;
  };

  const parseQuestionPeriodQuestions = (
    value: unknown,
  ): Array<{ question: string }> => {
    const questions: string[] = [];

    const addGroupedLines = (input: string) => {
      const trimmedInput = input.trim();
      if (!trimmedInput) return;

      // Try to parse JSON if provided as string
      if (
        (trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) ||
        (trimmedInput.startsWith("{") && trimmedInput.endsWith("}"))
      ) {
        try {
          const parsed = JSON.parse(trimmedInput);
          handle(parsed);
          return;
        } catch {
          // fall through to text handling
        }
      }

      const lines = trimmedInput.split(/\r?\n/);

      if (
        lines.length > 1 &&
        lines.every((line) => line.trim() && /\?$/.test(line.trim()))
      ) {
        const newQuestions = lines.map((line) => line.trim()).filter(Boolean);
        questions.push(...newQuestions);
        return;
      }

      const grouped: string[] = [];
      let buffer: string[] = [];

      const flush = () => {
        if (buffer.length === 0) return;
        const candidate = buffer.join("\n").trim();
        if (candidate) {
          grouped.push(candidate);
        }
        buffer = [];
      };

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.length === 0) {
          flush();
        } else {
          buffer.push(line);
        }
      }
      flush();

      if (grouped.length === 0) {
        grouped.push(trimmedInput);
      }

      grouped.forEach((segment) => {
        if (segment) {
          questions.push(segment);
        }
      });
    };

    const handle = (input: unknown): void => {
      if (input == null) return;
      if (Array.isArray(input)) {
        input.forEach(handle);
        return;
      }
      if (typeof input === "object") {
        const maybeQuestion = (input as any).question;
        if (typeof maybeQuestion === "string") {
          addGroupedLines(maybeQuestion);
        }
        return;
      }
      addGroupedLines(String(input));
    };

    handle(value);

    return questions.map((question) => ({ question }));
  };

  let missing_details: string[] | undefined;
  if (hasMissingDetails) {
    missing_details = parseCommaSeparated(missing_details_input);
  }

  let genres: string[] | undefined;
  if (hasGenres) {
    genres = parseCommaSeparated(genres_input);
  }

  let question_period_questions: Array<{ question: string }> | undefined;
  if (hasQuestionPeriodQuestions) {
    question_period_questions = parseQuestionPeriodQuestions(
      question_period_questions_input,
    );
  }

  const update: Record<string, unknown> = {
    lastUpdatedOn: new Date(),
  };
  if (title !== undefined) update.title = title;
  if (short_title !== undefined) update.short_title = short_title;
  if (summary !== undefined) update.summary = summary;
  if (final_judgment !== undefined) update.final_judgment = final_judgment;
  if (rationale !== undefined) update.rationale = rationale;
  if (steel_man !== undefined) update.steel_man = steel_man;
  if (missing_details !== undefined) {
    update.missing_details = missing_details;
  }
  if (genres !== undefined) {
    update.genres = genres;
  }
  if (question_period_questions !== undefined) {
    update.question_period_questions = question_period_questions;
  }
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

  const redirectPath = `${BASE_PATH || ""}/${id}`.replace(/\/+/g, "/");
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
