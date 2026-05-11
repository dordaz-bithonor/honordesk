import { NextResponse } from "next/server";

import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth-session";

export async function POST(request: Request) {
  const expected = process.env.HONORDESK_PIN;
  if (!expected) {
    return NextResponse.json(
      { error: "PIN no configurado en el servidor" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const pin = typeof body === "object" && body !== null && "pin" in body ? String((body as { pin: unknown }).pin) : "";

  if (pin !== expected) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
