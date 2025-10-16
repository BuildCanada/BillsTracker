import { createInterface } from "node:readline";

export type Environment = "dev" | "prod";

type EnvConfig = typeof import("@/env")["env"];

let envConfigPromise: Promise<EnvConfig> | null = null;

export function loadEnvConfig(): Promise<EnvConfig> {
  if (!envConfigPromise) {
    envConfigPromise = import("@/env").then((module) => module.env);
  }
  return envConfigPromise;
}

export async function getMongoUri(env: Environment): Promise<string> {
  if (env === "prod") {
    const prodUri = process.env.PROD_MONGO_URI;
    if (!prodUri || prodUri.trim() === "") {
      throw new Error(
        "PROD_MONGO_URI is not set in environment. Cannot connect to production database.",
      );
    }
    return prodUri.trim();
  }

  const envConfig = await loadEnvConfig();
  const devUri = envConfig.MONGO_URI;
  if (!devUri || devUri.trim() === "") {
    throw new Error(
      "MONGO_URI is not set in environment. Cannot connect to dev database.",
    );
  }
  return devUri.trim();
}

export function redactMongoUri(uri: string): string {
  return uri.replace(/\/\/([^@]+)@/, "//<REDACTED>@");
}

/**
 * Prompt the user for a yes/no confirmation.
 * Accepts "y" or "yes" (case-insensitive) as affirmative.
 */
export async function promptForConfirmation(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message}\n`, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}
