This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Magic link sign-in (dev only)

The app includes a simple email magic-link flow for a limited set of users.

Environment variables:

- `MAGIC_LINK_SECRET`: secret key for signing tokens (required)
- `APP_URL`: base URL for generating links (optional; defaults to `http://localhost:3000`)
- `SESSION_COOKIE_NAME`: cookie name for the session (optional; defaults to `auth_session`)

Endpoints:

- `POST /api/auth/magic` JSON `{ email, next? }` → issues a magic link. In development, the link is returned in the response for convenience.
- `GET /api/auth/verify?token=...&next=/` → verifies token, sets session cookie, redirects to `next`.
- `POST /api/auth/signout` → clears the session cookie.

Page:

- `/sign-in` → email form to request the link.

Allowed users are currently stubbed in `src/lib/auth/allowed-users.ts`. Replace this with a DB lookup later.
