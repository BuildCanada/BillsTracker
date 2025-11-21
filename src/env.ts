type NonEmpty<T extends string> = T & { __brand: "NonEmpty" };

function required(name: string, value: string | undefined): NonEmpty<string> {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value as NonEmpty<string>;
}

function optional(
  _name: string,
  value: string | undefined,
): string | undefined {
  return value && value.trim() !== "" ? value : undefined;
}

const ENDPOINT = "https://civics-project-kiyv.vercel.app";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXTAUTH_URL: optional("NEXTAUTH_URL", process.env.NEXTAUTH_URL),
  NEXTAUTH_SECRET: optional("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET),
  AUTH_SECRET: optional("AUTH_SECRET", process.env.AUTH_SECRET),
  GOOGLE_CLIENT_ID:
    optional("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID) ||
    optional("GOOGLE_ID", process.env.GOOGLE_ID),
  GOOGLE_CLIENT_SECRET:
    optional("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET) ||
    optional("GOOGLE_SECRET", process.env.GOOGLE_SECRET),
  CIVICS_PROJECT_API_KEY: optional(
    "CIVICS_PROJECT_API_KEY",
    process.env.CIVICS_PROJECT_API_KEY,
  ),
  CIVICS_PROJECT_BASE_URL: optional("CIVICS_PROJECT_BASE_URL", ENDPOINT),
  MONGO_URI: optional(
    "MONGO_URI",
    (process.env.MONGO_URI || process.env.MONGODB_URI)?.trim(),
  ),
  NEXT_PUBLIC_APP_URL: optional(
    "NEXT_PUBLIC_APP_URL",
    process.env.NEXT_PUBLIC_APP_URL,
  ),
};

export function assertServerEnv() {
  // Required for auth
  required("NEXTAUTH_URL", env.NEXTAUTH_URL);
  required(
    "NEXTAUTH_SECRET or AUTH_SECRET",
    env.NEXTAUTH_SECRET || env.AUTH_SECRET,
  );
  required("GOOGLE_CLIENT_ID/GOOGLE_ID", env.GOOGLE_CLIENT_ID);
  required("GOOGLE_CLIENT_SECRET/GOOGLE_SECRET", env.GOOGLE_CLIENT_SECRET);
}
