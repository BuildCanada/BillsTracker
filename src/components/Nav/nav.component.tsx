"use client";

import { PROJECT_NAME } from "@/consts/general";
import { BASE_PATH } from "@/utils/basePath";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "../ui/button";

export const Nav = () => {
  const { data: session }: { data: Session | null } = useSession();

  const handleSignOut = () => {
    const redirect = BASE_PATH || "/";
    signOut({ callbackUrl: redirect });
  };

  return (
    <div className="border-b border-[var(--panel-border)]/80 bg-[var(--panel)]/60 backdrop-blur supports-[backdrop-filter]:bg-[var(--panel)]/60">
      <div className="mx-auto max-w-[1120px] px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3">
            <img
              className="bg-[#932f2f] h-12 w-auto p-3"
              src="https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg"
              alt="Build Canada Logo"
            />
            <span className="text-2xl font-bold">{PROJECT_NAME}</span>
          </div>
        </Link>

        {/* <Link href="/budget" className="text-sm underline font-semibold">Budget 2025</Link> */}

        <nav className="hidden sm:flex items-center gap-3 text-sm">
          {session?.user && (
            <div className="flex items-center gap-3">
              <Button size="sm" variant="secondary" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};
