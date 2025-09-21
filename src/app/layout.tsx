import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer/footer.component";
import { SessionProvider } from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { env } from "@/env";
import { GoogleAnalytics } from '@next/third-parties/google'
import { GOOGLE_ANALYTICS_ID, PROJECT_NAME } from "@/consts/general";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Build Canada Bills",
    template: "%s · Build Canada Bills",
  },
  description: "Understand Canadian Federal Bills",
  metadataBase: env.NEXT_PUBLIC_APP_URL ? new URL(env.NEXT_PUBLIC_APP_URL) : undefined,
  openGraph: {
    type: "website",
    siteName: "Build Canada Bills",
    title: "Build Canada Bills",
    description: "Understand Canadian Federal Bills",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    site: "@buildcanada",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <div className="border-b border-[var(--panel-border)]/80 bg-[var(--panel)]/60 backdrop-blur supports-[backdrop-filter]:bg-[var(--panel)]/60">
            <div className="mx-auto max-w-[1120px] px-6 py-4 flex items-center justify-between">
              <Link href="/">
                <div className="flex items-center gap-3">
                  <img className="bg-[#932f2f] h-12 w-auto p-3" src='https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg' />
                  <span className="text-2xl font-bold">{PROJECT_NAME}</span>
                </div>
              </Link>

              <nav className="hidden sm:flex items-center gap-3 text-sm">
                {session?.user && (
                  <form action="/api/auth/signout" method="post">
                    <input type="hidden" name="callbackUrl" value="/" />
                    <button type="submit" className="underline">Sign out</button>
                  </form>
                )}
              </nav>
            </div>
          </div>
          {children}
          <Footer />
        </SessionProvider>
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />

      </body>
    </html>
  );
}
