import OpenAI from "openai";

let client: OpenAI | null = null;

/**
 * Lazily construct the shared OpenAI client.
 *
 * Construction is deferred (not at module load) because the SDK throws when
 * `OPENAI_API_KEY` is absent, and many modules that import the analysis code
 * are also loaded in contexts without a key (CI builds, tests, no-AI dev).
 * Callers must check `hasOpenAIKey()` first.
 *
 * `maxRetries` enables the SDK's built-in exponential backoff on transient
 * failures (429s/5xx); `timeout` bounds a single request.
 */
export function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({ maxRetries: 3, timeout: 120_000 });
  }
  return client;
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
