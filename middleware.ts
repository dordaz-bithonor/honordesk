import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { hasSession } from "@/lib/auth-session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const authed = hasSession(request);
  const isPin = pathname === "/pin" || pathname.startsWith("/pin/");

  if (!authed && !isPin) {
    return NextResponse.redirect(new URL("/pin", request.url));
  }

  if (authed && isPin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
