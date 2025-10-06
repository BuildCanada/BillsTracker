export const shouldShowDetermination = (
  vote: string | null | undefined
): boolean => {
  if (vote === null) return true;
  const normalized = (vote ?? "").toString().trim().toLowerCase();
  return normalized !== "abstain";
};