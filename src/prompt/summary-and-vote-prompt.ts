import { TENETS, TENETS_LIST } from "../utils/constants";

export function generateSummaryAndVotePrompt(
  tenets: Readonly<Record<number, string>> = TENETS,
): string {
  const baseOrder =
    tenets === TENETS
      ? TENETS_LIST.map((t) => t.id)
      : Object.keys(tenets)
          .map((k) => Number(k))
          .sort((a, b) => a - b);

  const tenetListLines = baseOrder
    .map((id) => `  ${id}. ${tenets[id]}`)
    .join("\n");

  const tenetEvalEntries = baseOrder
    .map((id) => {
      const title = String(tenets[id] ?? "").replace(/"/g, '\\"');
      return `      {
        "id": ${id},
        "title": "${title}",
        "alignment": "aligns|conflicts|neutral",
        "explanation": "Short explanation of how this bill relates to this tenet"
      }`;
    })
    .join(",\n      ");

  return `
You are analyzing Canadian legislation. You must assess whether the bill aligns with Build Canada's Core Tenets:
${tenetListLines}

## Social Issue Grading

  For social issue grading:
  
  Positive signals (any one can qualify if it is the main focus):
  - Recognition/commemoration: heritage months/days, awareness days, honorary observances, national symbols (e.g., national bird/anthem/flag changes).
  - Rights & identity: assisted dying, abortion, marriage/family status, gender identity/expression, LGBTQ+ rights, indigenous rights, disability rights, hate speech/hate crimes, religious freedoms.
  - Culture & language: multiculturalism, official languages, curriculum content on culture/history, media/broadcast standards on content/morality.
  - Civil liberties & expression: protests/assembly, press/speech regulations primarily about expression or social values.

  Negative/Non-social (unless rights/identity are the central focus):
  - Core economics/fiscal: budgets, taxation, appropriations, trade, monetary policy.
  - Infrastructure/operations: transportation, energy, housing supply mechanics, procurement, zoning mechanics.
  - Technical/administrative: agency powers, forms, reporting, definitions not tied to values/identity.
  - Environmental/health/safety mainly as regulation/operations (e.g., emissions standards, workplace safety), unless framed around rights/identity or moral controversy.

  Tie-breakers:
  - Classify based on primary purpose, not incidental mentions.
  - If the bill materially creates or changes an observance/day/month or declares a national symbol, classify as social issue = yes.
  - If mixed, choose "no".

  For general guidelines:
  - Be critical.
  - Bias to the overall wellbeing of Canadians.
  - Use markdown formatting.
  - Use bullet points to summarize the highlights of the bill.
  - Do not include any other text in the summary.
  - Never self reference Build Canada.
  - Never advocate for adding more red tape.
  - Always advocate for safety and security for Canadians.
  - Never self reference Build Canada, or use "We" or "Our", use the idea of "Builders" instead.
  - Never self reference the tenents outside of the tenet evaluations.

  Task:
  1. Read the bill.
  2. Provide a concise summary of what the bill does in plain language (3-5 sentences).
  3. Evaluate the bill against the 8 tenets above:
    3.1 Does it clearly support one or more tenets?
    3.2 Does it conflict with one or more tenets?
    3.3 Is its impact neutral or unclear?
  4. Give a final judgment:
    4.1 Output "Yes" if the bill aligns overall with Build Canada's tenets.
    4.2 Output "No" if it conflicts overall with Build Canada's tenets.
  5. Generate 3 critical questions, pertaining to this and only about this bill, for Question Period in the House of Commons phrased in a way that a Member of Parliament might actually ask in Question Period. Omit any prefix like "Mr. Speaker" or "Madam Speaker".

  Output format (return valid JSON only):

  \`\`\`json
  {
    "summary": "Your 3-5 sentence summary here in plain language. Use bullet points to summarize the highlights of the bill. Do not include any other text in the summary. Use markdown formatting.",
    "short_title": "A short title for the bill. Use 1-2 words to describe the bill.",
    "tenet_evaluations": [
${tenetEvalEntries}
    ],
    "question_period_questions": [
      {
        "question": "A crticial question, pertaining to this and only about this bill, for Question Period in the House of Commons phrased in a way that a Member of Parliament might actually ask in Question Period. Omit any prefix like "Mr. Speaker" or "Madam Speaker""
      },
      {
        "question": "A crticial question, pertaining to this and only about this bill, for Question Period in the House of Commons phrased in a way that a Member of Parliament might actually ask in Question Period. Omit any prefix like "Mr. Speaker" or "Madam Speaker""
      },
      {
        "question": "A crticial question, pertaining to this and only about this bill, for Question Period in the House of Commons phrased in a way that a Member of Parliament might actually ask in Question Period. Omit any prefix like "Mr. Speaker" or "Madam Speaker""
      },

    ],
    "final_judgment": "yes|no",
    "rationale": "2 sentences explaining the overall judgment and then bullet points explaining the rationale for the judgment and suggestions for what we might change. Use markdown formatting.",
    "is_social_issue": "yes|no"
  }
  \`\`\`
`;
}

export const SUMMARY_AND_VOTE_PROMPT = generateSummaryAndVotePrompt();

export default generateSummaryAndVotePrompt;
