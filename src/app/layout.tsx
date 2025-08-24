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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="border-b border-[var(--panel-border)]/80 bg-[var(--panel)]/60 backdrop-blur supports-[backdrop-filter]:bg-[var(--panel)]/60">
          <div className="mx-auto max-w-[1120px] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-[#c73f2b]" />
              <span className="font-semibold">Build Canada Bills</span>
            </div>
            <nav className="hidden sm:flex items-center gap-3 text-sm">
              <a className="hover:underline" href="#">Prime Minister</a>
              <a className="hover:underline" href="#">Finance</a>
              <a className="hover:underline" href="#">Housing</a>
              <a className="hover:underline" href="#">Health</a>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
