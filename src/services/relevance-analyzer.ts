import { OpenAI } from "openai";
import { RELEVANCE_ANALYSIS_PROMPT } from "@/prompt/relevance-analysis-prompt";

export interface RelevanceAnalysisResult {
  relevance_score: number;
  gdp_impact_percent: number;
  gdp_impact_confidence: "low" | "medium" | "high" | "unknown";
  gdp_impact_justification: string;
  relevance_justification: string;
  primary_mechanism: string;
  implementation_timeline: string;
}

export async function analyzeRelevance(
  billMarkdown: string,
): Promise<RelevanceAnalysisResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const client = new OpenAI();
    const prompt = `${RELEVANCE_ANALYSIS_PROMPT}\n\nBill Text:\n${billMarkdown}`;

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt,
      reasoning: {
        effort: "high",
      },
    });

    const responseText = response.output_text;
    if (!responseText) {
      return null;
    }

    // Extract JSON from response - handle markdown code blocks and plain JSON
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim();
    }

    // Find JSON object boundaries if not wrapped in code blocks
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0];
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText) as Record<string, unknown>;
    } catch (parseError) {
      console.error("Failed to parse relevance analysis JSON:", parseError);
      console.error("Response text:", responseText.substring(0, 500));
      return null;
    }

    return {
      relevance_score: (parsed.relevance_score as number) || 0,
      gdp_impact_percent: (parsed.gdp_impact_percent as number) || 0,
      gdp_impact_confidence:
        (parsed.gdp_impact_confidence as
          | "low"
          | "medium"
          | "high"
          | "unknown") || "unknown",
      gdp_impact_justification:
        (parsed.gdp_impact_justification as string) ||
        "No justification provided",
      relevance_justification:
        (parsed.relevance_justification as string) ||
        "No justification provided",
      primary_mechanism:
        (parsed.primary_mechanism as string) || "Not specified",
      implementation_timeline:
        (parsed.implementation_timeline as string) || "Not specified",
    };
  } catch (error) {
    console.error("Error analyzing relevance:", error);
    return null;
  }
}
