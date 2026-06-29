/**
 * Guardrail checks for AI-generated bill analysis text.
 *
 * The prompt forbids the model from self-referencing Build Canada, using
 * first-person "we"/"our", or naming the tenets outside the tenet evaluations.
 * These checks turn those rules into something testable and re-runnable — both
 * in the eval harness and (offline) against summaries already stored in the DB.
 *
 * Pure and dependency-free so it can be unit tested and reused anywhere.
 */
export interface GuardrailRule {
  label: string;
  pattern: RegExp;
}

export const GUARDRAIL_RULES: GuardrailRule[] = [
  { label: "self-reference: 'Build Canada'", pattern: /\bbuild canada\b/i },
  { label: "first-person: 'we'", pattern: /\bwe\b/i },
  { label: "first-person: 'our'", pattern: /\bour\b/i },
  { label: "tenet self-reference", pattern: /\btenets?\b/i },
];

/** Return the labels of any guardrail rules the given text violates. */
export function findGuardrailViolations(
  text: string | null | undefined,
): string[] {
  if (!text) return [];
  return GUARDRAIL_RULES.filter((rule) => rule.pattern.test(text)).map(
    (rule) => rule.label,
  );
}

/**
 * Check every prose field of an analysis. Returns a flat list of
 * `field: violation` strings (empty when clean).
 */
export function checkAnalysisGuardrails(fields: {
  summary?: string;
  rationale?: string;
  steel_man?: string;
  questions?: Array<{ question: string }>;
}): string[] {
  const violations: string[] = [];
  const add = (field: string, text: string | undefined) => {
    for (const v of findGuardrailViolations(text)) {
      violations.push(`${field}: ${v}`);
    }
  };
  add("summary", fields.summary);
  add("rationale", fields.rationale);
  add("steel_man", fields.steel_man);
  (fields.questions ?? []).forEach((q, i) => {
    add(`question[${i}]`, q.question);
  });
  return violations;
}
