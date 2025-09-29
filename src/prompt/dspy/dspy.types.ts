export interface TenentEvaluation {
  id: number;
  title: string;
  alignment: "aligns" | "conflicts" | "neutral";
  explanation: string;
}

export type TenetEvaluation = TenentEvaluation;

export interface QuestionPeriodQuestion {
  question: string;
}

export interface BillAnalysisExample {
  input: {
    bill_number: string;
    bill_title: string;
    bill_content: string;
  };
  output: {
    summary: string;
    short_title: string;
    tenet_evaluations: TenetEvaluation[];
    question_period_questions: QuestionPeriodQuestion[];
    final_judgment: "yes" | "no" | "neutral";
    rationale: string;
    is_social_issue: "yes" | "no";
  };
}
