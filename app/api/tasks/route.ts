import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { formatTaskResponse } from "@/lib/format-task-response";
import { getDefaultTaskCreatorId } from "@/lib/get-default-task-creator";
import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import type { Prisma, Priority, ServiceType, TaskStatus } from "@prisma/client";

const SERVICE_TYPES: ServiceType[] = ["SPA", "PAY_IN_OUT", "EMPRESAS", "NOMINA"];
const TASK_STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS", "DONE"];
const PRIORITIES: Priority[] = ["URGENT", "HIGH", "NORMAL", "LOW"];

function parseTaskWhere(searchParams: URLSearchParams): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = {};

  const clientId = searchParams.get("clientId")?.trim();
  if (clientId) where.clientId = clientId;

  const service = searchParams.get("service")?.trim();
  if (service && SERVICE_TYPES.includes(service as ServiceType)) {
    where.service = service as ServiceType;
  }

  const statusRaw = searchParams.get("status")?.trim();
  if (statusRaw && statusRaw !== "all") {
    const parts = statusRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = parts.filter((s): s is TaskStatus =>
      TASK_STATUSES.includes(s as TaskStatus)
    );
    if (valid.length === 1) where.status = valid[0];
    else if (valid.length > 1) where.status = { in: valid };
  }

  return where;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const where = parseTaskWhere(searchParams);

  const scopedToOneClient = Boolean(where.clientId);

  const tasks = await prisma.task.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      creator: { select: { name: true } },
    },
    orderBy: scopedToOneClient
      ? [{ order: "asc" }, { createdAt: "desc" }]
      : [{ backlogOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks.map((t) => formatTaskResponse(t)));
}

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

  const body = raw as Record<string, unknown>;
  const clientId = typeof body.clientId === "string" ? body.clientId.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" && body.description.trim() !== ""
      ? body.description.trim()
      : null;

  if (!clientId || !title) {
    return NextResponse.json({ error: "clientId y title son obligatorios" }, { status: 400 });
  }

  const serviceRaw = body.service;
  if (typeof serviceRaw !== "string" || !SERVICE_TYPES.includes(serviceRaw as ServiceType)) {
    return NextResponse.json({ error: "service inválido" }, { status: 400 });
  }
  const service = serviceRaw as ServiceType;

  let priority: Priority = "NORMAL";
  if (typeof body.priority === "string" && PRIORITIES.includes(body.priority as Priority)) {
    priority = body.priority as Priority;
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { services: { select: { service: true } } },
  });
  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const clientServices = new Set(client.services.map((s) => s.service));
  if (!clientServices.has(service)) {
    return NextResponse.json(
      { error: "El servicio no está contratado para este cliente" },
      { status: 400 }
    );
  }

  let createdBy: string;
  try {
    createdBy = await getDefaultTaskCreatorId();
  } catch {
    return NextResponse.json(
      { error: "No se pudo asignar un creador a la solicitud. Revisa la base de datos." },
      { status: 503 }
    );
  }

  const maxOrder = await prisma.task.aggregate({
    where: { clientId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? -1) + 1;

  const maxBacklog = await prisma.task.aggregate({
    _max: { backlogOrder: true },
  });
  const backlogOrder = (maxBacklog._max.backlogOrder ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      clientId,
      service,
      priority,
      createdBy,
      order,
      backlogOrder,
    },
    include: {
      client: { select: { id: true, name: true } },
      creator: { select: { name: true } },
    },
  });

  return NextResponse.json(formatTaskResponse(task), { status: 201 });
}
