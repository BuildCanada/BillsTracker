// Temporary stub. Replace with DB lookup later.
const allowedEmailsStub = [
  "you@example.com",
  "founder@example.com",
  "mikaal@example.com",
  "test.user@example.com",
  "matthewnaik@gmail.com",
];

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return allowedEmailsStub.includes(normalized);
};

export function getAllowedEmails(): string[] {
  return [...allowedEmailsStub];
}


