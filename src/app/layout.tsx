import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer/footer.component";
import { SessionProvider } from "@/components/SessionProvider";
import { env } from "@/env";
import { GoogleAnalytics } from '@next/third-parties/google'
import { GOOGLE_ANALYTICS_ID, } from "@/consts/general";
import { Nav } from "@/components/Nav/nav.component";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
          <Nav user={session?.user} />
          {children}
          <Footer />
        </SessionProvider>
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />

      </body>
    </html>
  );
}
