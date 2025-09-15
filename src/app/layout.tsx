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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
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
                <div className="flex items-start gap-3">
                  <img
                    src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg"
                    alt="Build Canada"
                    className="bg-[#932f2f] h-10 w-auto p-2 rounded"
                  />
                  <div className="flex flex-col items-start -mt-1 ">

                    <span className="font-semibold text-lg mb-0">Policy Tracker</span>
                    <div className="text-xs">

                      Powered by {' '}
                      <a href="https://civicsproject.org" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted-foreground)] underline">
                        The Civics Project
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Navigation Links */}


              {/* Contact & Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Connect</h3>
                <div className="space-y-2">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Questions or feedback?
                  </p>
                  <a href="mailto:hello@buildcanada.ca"
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    hello@buildcanada.ca
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-8 pt-8 border-t border-[var(--panel-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-[var(--muted-foreground)]">
                © {new Date().getFullYear()} Build Canada Bills. All rights reserved.
                A Project of {' '}
                <a href="https://buildcanada.ca" target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted-foreground)] underline">
                  Build Canada
                </a>

              </p>

            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
