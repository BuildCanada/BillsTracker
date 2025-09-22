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

## Authentication

The app uses NextAuth.js with Google OAuth for authentication.

### Environment Variables Required:

- `NEXTAUTH_URL`: Base URL of your application (e.g., `http://localhost:3000` or `https://buildcanada.com/bills`)
- `NEXTAUTH_SECRET`: Secret key for signing JWT tokens
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `MONGO_URI`: MongoDB connection string
- `NEXT_PUBLIC_APP_URL`: Public URL of your application (optional, for metadata)

### Troubleshooting:

If you get a JSON parsing error when navigating to the sign-in page:

1. **Check environment variables**:
   - Create a `.env.local` file in the project root
   - Set the required variables (see list above)
   - Run `node test-env.js` to verify they're set correctly

2. **Check the debug endpoint**: Visit `http://localhost:3000/api/auth/debug` to see which variables are detected

3. **Verify the NextAuth route**: Visit `http://localhost:3000/api/auth/session` directly to see if it returns JSON

4. **Check browser console**: Look for any client-side errors

5. **Ensure NEXTAUTH_URL is correct**: This should be your full base URL (e.g., `http://localhost:3000` for development)

### Quick Test:

After setting up your environment variables, run:
```bash
node test-env.js
npm run dev
```

Then visit `http://localhost:3000` and click the "Sign In" button. You should see a loading spinner briefly, then either the sign-in button or your user info.

### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add these URLs to your OAuth consent screen:
   - **Authorized JavaScript Origins**: `https://buildcanada.com`
   - **Authorized Redirect URIs**: `https://buildcanada.com/bills/api/auth/callback/google`

### Features:

- Users can sign in with Google accounts
- New users are automatically created in the database
- Admin approval is required for new users (controlled by `allowed` field in User model)
- Session management with automatic database sync
