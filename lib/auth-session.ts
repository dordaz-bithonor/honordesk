import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "honordesk_session";
export const SESSION_VALUE = "authenticated";

export function hasSession(request: NextRequest): boolean {
  return request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

/** Returns a 401 JSON response if the session cookie is missing or invalid. */
export function requireSession(request: NextRequest): NextResponse | null {
  if (!hasSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
