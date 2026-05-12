import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";

/**
 * Reordenación global del backlog (modo lista).
 * `orderedIds` debe contener **todos** los ids de tareas en la base, sin duplicados,
 * en el orden deseado (índice 0 = arriba del todo).
 */
export async function POST(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const orderedIds = (raw as Record<string, unknown>).orderedIds;
  if (!Array.isArray(orderedIds) || !orderedIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "orderedIds debe ser un array de strings" }, { status: 400 });
  }

  const ids = orderedIds as string[];
  const total = await prisma.task.count();
  if (ids.length !== total) {
    return NextResponse.json(
      { error: `Debes enviar los ${total} ids de tareas (sin filtros en la lista). Recibidos: ${ids.length}.` },
      { status: 400 }
    );
  }
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "orderedIds contiene duplicados" }, { status: 400 });
  }

  const existing = new Set((await prisma.task.findMany({ select: { id: true } })).map((r) => r.id));
  for (const id of ids) {
    if (!existing.has(id)) {
      return NextResponse.json({ error: `Id de tarea desconocido: ${id}` }, { status: 400 });
    }
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { backlogOrder: index },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
