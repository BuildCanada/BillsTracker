import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer/footer.component";
import { SessionProvider } from "@/components/SessionProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  BUILD_CANADA_TWITTER_HANDLE,
  GOOGLE_ANALYTICS_ID,
  PROJECT_NAME,
} from "@/consts/general";
import { Nav } from "@/components/Nav/nav.component";
import { SimpleAnalytics } from "@/components/SimpleAnalytics";
import { Toaster } from "@/components/ui/sonner";
import { getCanonicalOrigin } from "@/utils/seo";

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
    default: PROJECT_NAME,
    template: `%s · ${PROJECT_NAME}`,
  },
  description: "Understand Canadian Federal Bills",
  metadataBase: new URL(getCanonicalOrigin()),
  openGraph: {
    type: "website",
    siteName: PROJECT_NAME,
    title: PROJECT_NAME,
    description: "Understand Canadian federal bills through a builder's lens",
    url: "/",
    images: [
      {
        url: "https://buildcanada.com/bills/builder-mp-seo-image.png",
        width: 1200,
        height: 630,
        alt: "Builder MP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: BUILD_CANADA_TWITTER_HANDLE,
    creator: BUILD_CANADA_TWITTER_HANDLE,
    title: PROJECT_NAME,
    description: "Understand Canadian Federal Bills",
    images: ["https://buildcanada.com/bills/builder-mp-seo-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Nav />
          {children}
          <Footer />
        </SessionProvider>
        <Toaster richColors position="top-center" />
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />
        <SimpleAnalytics />
      </body>
    </html>
  );
}
