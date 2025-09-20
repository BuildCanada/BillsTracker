import { NextRequest, NextResponse } from "next/server";

// Rewrite legacy /api/auth/* calls to respect basePath "/bills".
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/")) {
    const target = new URL(`/bills${pathname}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.rewrite(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/:path*"],
};


