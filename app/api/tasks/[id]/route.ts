import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { formatTaskResponse } from "@/lib/format-task-response";
import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import type { Priority, ServiceType, TaskStatus } from "@prisma/client";

const STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE"];
const PRIORITIES: Priority[] = ["URGENT", "HIGH", "NORMAL", "LOW"];
const SERVICE_TYPES: ServiceType[] = ["SPA", "PAY_IN_OUT", "EMPRESAS", "NOMINA"];

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          services: { select: { service: true } },
        },
      },
      creator: { select: { name: true } },
    },
  });

  if (!task) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...formatTaskResponse(task),
    allowedServices: task.client.services.map((s) => s.service),
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const body = raw as Record<string, unknown>;
  const data: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: Priority;
    service?: ServiceType;
    backlogOrder?: number;
  } = {};

  if (typeof body.title === "string") {
    const t = body.title.trim();
    if (!t) return NextResponse.json({ error: "title no puede estar vacío" }, { status: 400 });
    data.title = t;
  }

  if (body.description !== undefined) {
    if (body.description === null) {
      data.description = null;
    } else if (typeof body.description === "string") {
      const d = body.description.trim();
      data.description = d === "" ? null : d;
    } else {
      return NextResponse.json({ error: "description inválido" }, { status: 400 });
    }
  }

  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !STATUSES.includes(body.status as TaskStatus)) {
      return NextResponse.json({ error: "status inválido" }, { status: 400 });
    }
    data.status = body.status as TaskStatus;
  }

  if (body.priority !== undefined) {
    if (typeof body.priority !== "string" || !PRIORITIES.includes(body.priority as Priority)) {
      return NextResponse.json({ error: "priority inválido" }, { status: 400 });
    }
    data.priority = body.priority as Priority;
  }

  if (body.service !== undefined) {
    if (typeof body.service !== "string" || !SERVICE_TYPES.includes(body.service as ServiceType)) {
      return NextResponse.json({ error: "service inválido" }, { status: 400 });
    }
    const nextService = body.service as ServiceType;
    const client = await prisma.client.findUnique({
      where: { id: existing.clientId },
      include: { services: { select: { service: true } } },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }
    const clientServices = new Set(client.services.map((s) => s.service));
    if (!clientServices.has(nextService)) {
      return NextResponse.json(
        { error: "El servicio no está contratado para este cliente" },
        { status: 400 }
      );
    }
    data.service = nextService;
  }

  if (body.backlogOrder !== undefined) {
    const raw = body.backlogOrder;
    const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      return NextResponse.json({ error: "backlogOrder debe ser un entero" }, { status: 400 });
    }
    data.backlogOrder = n;
  }

  if (Object.keys(data).length === 0) {
    const t = await prisma.task.findUniqueOrThrow({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        creator: { select: { name: true } },
      },
    });
    return NextResponse.json(formatTaskResponse(t));
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      client: { select: { id: true, name: true } },
      creator: { select: { name: true } },
    },
  });

  return NextResponse.json(formatTaskResponse(task));
}
