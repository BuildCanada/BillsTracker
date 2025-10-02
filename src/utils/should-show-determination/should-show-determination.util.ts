import { TenetEvaluation } from "@/models/Bill";
import { isSingleTenet } from "@/utils/vote-display";

type TenetAlignmentLike = TenetEvaluation["alignment"] | null | undefined;

type TenetEvaluationLike = {
  alignment?: TenetAlignmentLike;
};

type ShouldShowDeterminationParams = {
  vote: string | null | undefined;
  isSocialIssue?: boolean | null;
  tenetEvaluations?: (TenetEvaluationLike | null | undefined)[] | null;
};

export const shouldShowDetermination = ({
  vote,
  isSocialIssue,
  tenetEvaluations,
}: ShouldShowDeterminationParams): boolean => {
  const normalizedVote = vote?.toString?.().toLowerCase?.() ?? "";
  const isVoteNeutral = normalizedVote === "neutral";
  const normalizedIsSocialIssue = Boolean(isSocialIssue);
  const normalizedEvaluations: Parameters<typeof isSingleTenet>[0] = (
    tenetEvaluations ?? []
  )
    .filter((evaluation): evaluation is TenetEvaluationLike => Boolean(evaluation))
    .map((evaluation) => ({
      alignment:
        evaluation.alignment === "aligns" ||
          evaluation.alignment === "conflicts" ||
          evaluation.alignment === "neutral"
          ? evaluation.alignment
          : undefined,
    }));
  const forceNeutral = isSingleTenet(normalizedEvaluations);

  if (isVoteNeutral) return false;
  if (normalizedIsSocialIssue) return false;
  if (forceNeutral) return false;

  return true;
};