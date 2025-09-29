import * as dotenv from "dotenv";
import * as path from "node:path";
import {
  AxGEPA,
  AxAIOpenAI,
  AxAIOpenAIModel,
  type AxParetoResult,
} from "@ax-llm/ax";
import { summarizeAndVote } from "./signature";
import { loadExamples } from "./examples";
import { voteAccuracy } from "./metric";
import { promises as fs } from "node:fs";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env.local") });

/**
 * Train the Ax program using GEPA with the "light" preset and save the result.
 * Output file: optimizations/summary-vote.v1.json
 */
export async function train(): Promise<void> {
  console.log("[ax/train] Loading examples...");
  const examples = await loadExamples();
  console.log(`[ax/train] Loaded ${examples.length} examples`);

  // Create AI service for the optimizer
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required");
  }
  const ai = new AxAIOpenAI({
    apiKey,
    config: {
      model: AxAIOpenAIModel.GPT5Mini,
    },
  });

  const optimizer = new AxGEPA({ studentAI: ai });
  optimizer.configureAuto("light"); // tiny, fast defaults

  console.log("[ax/train] Running GEPA optimization (auto: light)...");

  // Create a compatible metric function
  const metricFn = ({ prediction, example }: any) => {
    return voteAccuracy({ prediction, example });
  };

  const result = (await optimizer.compile(
    summarizeAndVote,
    examples as any,
    metricFn,
    { maxMetricCalls: 100 }, // Add maxMetricCalls as a compile option
  )) as AxParetoResult<any>;

  if (result?.demos && result.demos.length > 0) {
    const outputDir = "optimizations";
    const outputPath = `${outputDir}/summary-vote.v1.json`;
    await fs.mkdir(outputDir, { recursive: true });
    // Save the demos which contain the optimized prompts
    const optimization = {
      demos: result.demos,
      bestScore: result.bestScore,
      stats: result.stats,
    };
    await fs.writeFile(
      outputPath,
      JSON.stringify(optimization, null, 2),
      "utf8",
    );
    console.log(`[ax/train] Saved optimization to ${outputPath}`);
    console.log(`[ax/train] Best score: ${result.bestScore}`);
  } else {
    console.warn("[ax/train] No optimized program returned by GEPA.");
  }
}

// Allow execution via `tsx src/prompt/dspy/ax/train.ts`
if (typeof require !== "undefined" && require.main === module) {
  train().catch((err) => {
    console.error("[ax/train] Training failed:", err);
    process.exit(1);
  });
}
