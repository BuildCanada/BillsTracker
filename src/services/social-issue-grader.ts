import { OpenAI } from "openai";

const SOCIAL_ISSUE_GRADER_PROMPT = `
You are a policy classifier. Your sole task is to decide whether a bill is primarily a social issue.

Definition — Social Issue (for this classifier):
A bill is a social issue if its primary purpose centers on culture, identity, values, or rights in society — including recognition/commemoration, national symbols, moral/ethical questions, language and heritage, religion, family/sex/reproduction, education content, speech/censorship, discrimination/equality, civil liberties, and community identity.

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

Output exactly this JSON:
{
  "is_social_issue": "yes|no"
}`;


// This defaults to false and a verdict will present to the user
export const socialIssueGrader = async (text: string): Promise<boolean> => {
  // Fast path when no API key
  if (!process.env.OPENAI_API_KEY) {
    return false;
  }

  try {
    const client = new OpenAI();
    const input = `${SOCIAL_ISSUE_GRADER_PROMPT}\n\nBill content:\n${text?.slice(0, 8000)}`;
    const response = await client.responses.create({ model: "gpt-5", input });
    const raw = response.output_text;
    try {
      const parsed = JSON.parse(raw || "{}") as { is_social_issue?: string };
      return (parsed.is_social_issue || "no").toLowerCase() === "yes";
    } catch {
      // Try to detect yes/no in raw
      const yes = /is[_\s-]?social[_\s-]?issue\s*["':\s]*yes/i.test(raw || "");
      const no = /is[_\s-]?social[_\s-]?issue\s*["':\s]*no/i.test(raw || "");
      if (yes || no) return yes;
      return false;
    }
  } catch (err) {
    return false;
  }
}

