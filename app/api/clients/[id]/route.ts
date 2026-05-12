import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { formatClientResponse } from "@/lib/format-client-response";
import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import type { ClientStatus, ServiceType } from "@prisma/client";

const CLIENT_STATUSES: ClientStatus[] = ["ACTIVE", "INACTIVE", "ONBOARDING"];
const SERVICE_TYPES: ServiceType[] = ["SPA", "PAY_IN_OUT", "EMPRESAS", "NOMINA"];

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireSession(_request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      services: { orderBy: { service: "asc" } },
      tasks: { select: { priority: true, status: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  return NextResponse.json(
    formatClientResponse(client, { services: true, taskCounts: true, notes: true })
  );
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
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

  const data: { name?: string; country?: string; status?: ClientStatus; notes?: string | null } = {};

  if (typeof body.name === "string") {
    const n = body.name.trim();
    if (!n) return NextResponse.json({ error: "name no puede estar vacío" }, { status: 400 });
    data.name = n;
  }
  if (typeof body.country === "string") {
    const c = body.country.trim();
    if (!c) return NextResponse.json({ error: "country no puede estar vacío" }, { status: 400 });
    data.country = c;
  }
  if (typeof body.status === "string") {
    if (!CLIENT_STATUSES.includes(body.status as ClientStatus)) {
      return NextResponse.json({ error: "status inválido" }, { status: 400 });
    }
    data.status = body.status as ClientStatus;
  }
  if ("notes" in body) {
    if (body.notes === null) {
      data.notes = null;
    } else if (typeof body.notes === "string") {
      const trimmed = body.notes.trim();
      data.notes = trimmed === "" ? null : trimmed;
    } else {
      return NextResponse.json({ error: "notes debe ser string o null" }, { status: 400 });
    }
  }

  const servicesRaw = body.services;
  let serviceList: ServiceType[] | undefined;
  if (servicesRaw !== undefined) {
    if (!Array.isArray(servicesRaw) || servicesRaw.length === 0) {
      return NextResponse.json({ error: "services debe ser un array con al menos un servicio" }, { status: 400 });
    }
    const parsed: ServiceType[] = [];
    for (const s of servicesRaw) {
      if (typeof s !== "string" || !SERVICE_TYPES.includes(s as ServiceType)) {
        return NextResponse.json({ error: `Servicio inválido: ${String(s)}` }, { status: 400 });
      }
      parsed.push(s as ServiceType);
    }
    serviceList = [...new Set(parsed)];
  }

  if (Object.keys(data).length === 0 && serviceList === undefined) {
    const full = await prisma.client.findUniqueOrThrow({
      where: { id },
      include: {
        services: { orderBy: { service: "asc" } },
        tasks: { select: { priority: true, status: true } },
      },
    });
    return NextResponse.json(
      formatClientResponse(full, { services: true, taskCounts: true, notes: true })
    );
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(data).length > 0) {
      await tx.client.update({
        where: { id },
        data,
      });
    }
    if (serviceList) {
      await tx.clientService.deleteMany({ where: { clientId: id } });
      await tx.clientService.createMany({
        data: serviceList.map((service) => ({ clientId: id, service })),
      });
    }
  });

  const full = await prisma.client.findUniqueOrThrow({
    where: { id },
    include: {
      services: { orderBy: { service: "asc" } },
      tasks: { select: { priority: true, status: true } },
    },
  });

  return NextResponse.json(
    formatClientResponse(full, { services: true, taskCounts: true, notes: true })
  );
}
