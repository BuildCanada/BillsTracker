import { PROJECT_NAME } from "@/consts/general"
import { Session } from "next-auth"
import Link from "next/link"

export const Nav = ({ user }: { user: Session["user"] | null }) => {
  return (
    <div className="border-b border-[var(--panel-border)]/80 bg-[var(--panel)]/60 backdrop-blur supports-[backdrop-filter]:bg-[var(--panel)]/60">
      <div className="mx-auto max-w-[1120px] px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3">
            <img className="bg-[#932f2f] h-12 w-auto p-3" src='https://cdn.prod.website-files.com/679d23fc682f2bf860558c9a/679d23fc682f2bf860558cc6_build_canada-wordmark.svg' />
            <span className="text-2xl font-bold">{PROJECT_NAME}</span>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-3 text-sm">
          {user && (
            <form action="/api/auth/signout" method="post">
              <input type="hidden" name="callbackUrl" value="/" />
              <button type="submit" className="underline">Sign out</button>
            </form>
          )}
        </nav>
      </div>
    </div>
  )
}