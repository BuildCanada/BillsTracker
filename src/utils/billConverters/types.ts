// Unified bill data structure shared across the app
export interface UnifiedBill {
  billId: string;
  title: string;
  short_title?: string;
  summary: string;
  status: string;
  sponsorParty?: string;
  chamber?: string;
  supportedRegion?: string;
  introducedOn?: Date;
  lastUpdatedOn?: Date;
  stages: {
    stage: string;
    state: string;
    house: string;
    date: Date;
  }[];
  genres?: string[];
  parliamentNumber?: number;
  sessionNumber?: number;
  votes?: Array<{ motion?: string; result: string }>;
  fullTextMarkdown?: string | null;
  isSocialIssue?: boolean;
  question_period_questions?: Array<{ question: string }>;
  // Analysis data from AI
  tenet_evaluations?: Array<{
    id: number;
    title: string;
    alignment: "aligns" | "conflicts" | "neutral";
    explanation: string;
  }>;
  final_judgment: "yes" | "no" | "abstain";
  rationale?: string;
  needs_more_info?: boolean;
  missing_details?: string[];
  steel_man?: string;
}
