import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Build Canada Bills",
  description: "Understand Canadian Federal Bills",
  metadataBase: new URL('https://buildcanada.ca'),
  openGraph: {
    title: "Build Canada Bills",
    description: "Understand Canadian Federal Bills",
    url: "https://buildcanada.ca",
    siteName: "Build Canada Bills",
    type: "website",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Build Canada Bills - Understand Canadian Federal Bills",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build Canada Bills",
    description: "Understand Canadian Federal Bills",
    creator: "@buildcanada",
    site: "@buildcanada",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="border-b border-[var(--panel-border)]/80 bg-[var(--panel)]/60 backdrop-blur supports-[backdrop-filter]:bg-[var(--panel)]/60">
          <div className="mx-auto max-w-[1120px] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg" alt="Build Canada" className="bg-[#932f2f] h-12 w-auto p-3" />
              <span className="font-semibold">Policy Tracker</span>
            </div>
            <nav className="hidden sm:flex items-center gap-3 text-sm">

            </nav>
          </div>
        </div>
        {children}
        <footer className="mt-16 border-t border-[var(--panel-border)] bg-white">
          <div className="mx-auto max-w-[1120px] px-6 py-12">
            <div className="flex justify-between">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg"
                    alt="Build Canada"
                    className="bg-[#932f2f] h-10 w-auto p-2 rounded"
                  />
                  <span className="font-semibold text-lg">Policy Tracker</span>
                </div>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  XXXX XXX XXX XXX
                </p>
              </div>

              {/* Navigation Links */}


              {/* Contact & Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Connect</h3>
                <div className="space-y-2">
                  <p className="text-sm text-[var(--muted)]">
                    Questions or feedback?
                  </p>
                  <a href="mailto:hello@buildcanada.ca"
                    className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    hello@buildcanada.ca
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-[var(--panel-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-[var(--muted)]">
                © {new Date().getFullYear()} Build Canada. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
                <span>Made with ❤️ for Canadian democracy</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
