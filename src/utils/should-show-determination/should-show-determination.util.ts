import { TenetEvaluation } from "@/models/Bill";
import { shouldForceNeutral } from "@/utils/vote-display";

type ShouldShowDeterminationParams = {
  vote: string;
  isSocialIssue: boolean;
  tenetEvaluations: Pick<TenetEvaluation, "alignment">[];
};

export const shouldShowDetermination = ({
  vote,
  isSocialIssue,
  tenetEvaluations,
}: ShouldShowDeterminationParams): boolean => {
  const normalizedVote = vote?.toLowerCase?.() ?? "";
  const isVoteNeutral = normalizedVote === "neutral";
  const forceNeutral = shouldForceNeutral(tenetEvaluations ?? []);

  if (isVoteNeutral) return false;
  if (isSocialIssue) return false;
  if (forceNeutral) return false;

  return true;
};