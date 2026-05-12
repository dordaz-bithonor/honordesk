import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { formatClientResponse } from "@/lib/format-client-response";
import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { ClientStatus, ServiceType } from "@prisma/client";

const CLIENT_STATUSES: ClientStatus[] = ["ACTIVE", "INACTIVE", "ONBOARDING"];
const SERVICE_TYPES: ServiceType[] = ["SPA", "PAY_IN_OUT", "EMPRESAS", "NOMINA"];

function parseInclude(raw: string | null): Set<string> {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function GET(request: NextRequest) {
  const unauthorized = requireSession(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const include = parseInclude(searchParams.get("include"));
  const wantServices = include.has("services");
  const wantTaskCounts = include.has("taskCounts");

  const statusParam = searchParams.get("status") as ClientStatus | null;
  const where =
    statusParam && CLIENT_STATUSES.includes(statusParam)
      ? { status: statusParam }
      : {};

  const clients = await prisma.client.findMany({
    where,
    include: {
      ...(wantServices ? { services: { orderBy: { service: "asc" as const } } } : {}),
      ...(wantTaskCounts
        ? {
            tasks: {
              select: { priority: true, status: true },
            },
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  const payload = clients.map((c) =>
    formatClientResponse(c, { services: wantServices, taskCounts: wantTaskCounts })
  );

  return NextResponse.json(payload);
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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  if (!name || !country) {
    return NextResponse.json({ error: "name y country son obligatorios" }, { status: 400 });
  }

  let status: ClientStatus = "ACTIVE";
  if (typeof body.status === "string" && CLIENT_STATUSES.includes(body.status as ClientStatus)) {
    status = body.status as ClientStatus;
  }

  const servicesRaw = body.services;
  if (!Array.isArray(servicesRaw) || servicesRaw.length === 0) {
    return NextResponse.json({ error: "Indica al menos un servicio" }, { status: 400 });
  }

  const services: ServiceType[] = [];
  for (const s of servicesRaw) {
    if (typeof s !== "string" || !SERVICE_TYPES.includes(s as ServiceType)) {
      return NextResponse.json({ error: `Servicio inválido: ${String(s)}` }, { status: 400 });
    }
    services.push(s as ServiceType);
  }
  const uniqueServices = [...new Set(services)];

  try {
    const createdId = await prisma.$transaction(async (tx) => {
      const c = await tx.client.create({
        data: { name, country, status },
      });
      await tx.clientService.createMany({
        data: uniqueServices.map((service) => ({ clientId: c.id, service })),
      });
      return c.id;
    });

    const full = await prisma.client.findUniqueOrThrow({
      where: { id: createdId },
      include: {
        services: { orderBy: { service: "asc" } },
        tasks: { select: { priority: true, status: true } },
      },
    });

    return NextResponse.json(
      formatClientResponse(full, { services: true, taskCounts: true }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creando cliente", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        {
          error:
            "La base de datos no tiene tablas. En la raíz del proyecto ejecuta: npm run db:migrate:deploy. Si ese comando falla con P1001 al host db.*.supabase.co, pon DIRECT_URL con la URI «Session mode» del pooler (*.pooler.supabase.com:5432) que indica Supabase, guarda .env.local y vuelve a ejecutar migrate deploy.",
        },
        { status: 503 }
      );
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error:
            "No se puede conectar a la base de datos. Revisa DATABASE_URL y DIRECT_URL en .env.local",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "No se pudo crear el cliente (error interno)" },
      { status: 500 }
    );
  }
}
