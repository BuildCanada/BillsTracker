// Initial allowed users for bootstrapping the system
// In production, users are managed through the database via API endpoints

export const INITIAL_ALLOWED_USERS = [
  // Add initial admin users here - these will be automatically created with allowed: true
  // Example: "admin@example.com",
];

export function isInitiallyAllowed(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return INITIAL_ALLOWED_USERS.includes(normalizedEmail);
}

