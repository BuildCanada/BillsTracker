import type { BillDocument } from "@/models/Bill";
import { normalizeFinalJudgment } from "./normalize-final-judgment";
import type { UnifiedBill } from "./types";

// Convert Build Canada DB bill to unified format
export function fromBuildCanadaDbBill(bill: BillDocument): UnifiedBill {
  return {
    billId: bill.billId,
    title: bill.title,
    short_title: bill.short_title,
    summary: bill.summary,
    status: bill.status,
    sponsorParty: bill.sponsorParty,
    chamber: bill.chamber,
    supportedRegion: bill.supportedRegion,
    introducedOn: bill.introducedOn,
    lastUpdatedOn: bill.lastUpdatedOn,
    stages: bill.stages
      ? bill.stages.map((stage) => ({
          stage: stage.stage,
          state: stage.state,
          house: stage.house,
          date: stage.date,
        }))
      : [],
    genres: bill.genres ? [...bill.genres] : undefined,
    parliamentNumber: bill.parliamentNumber,
    sessionNumber: bill.sessionNumber,
    votes: bill.votes?.map((v) => ({
      motion: v.motion,
      result: v.result,
    })),
    isSocialIssue: bill.isSocialIssue,
    // Properly serialize question_period_questions to remove MongoDB ObjectIds
    question_period_questions: bill.question_period_questions?.map((q) => ({
      question: q.question,
    })),
    // Include analysis data - ensure proper serialization
    tenet_evaluations: bill.tenet_evaluations?.map((te) => ({
      id: te.id,
      title: te.title,
      alignment: te.alignment,
      explanation: te.explanation,
    })),
    final_judgment: normalizeFinalJudgment(bill.final_judgment),
    rationale: bill.rationale,
    needs_more_info: bill.needs_more_info,
    missing_details: bill.missing_details
      ? [...bill.missing_details]
      : undefined,
    steel_man: bill.steel_man,
  };
}
