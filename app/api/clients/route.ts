import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { requireSession } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import type { ClientStatus, Priority, TaskStatus } from "@prisma/client";

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
    statusParam && ["ACTIVE", "INACTIVE", "ONBOARDING"].includes(statusParam)
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

  type TaskMini = { priority: Priority; status: TaskStatus };

  const payload = clients.map((c) => {
    const row: Record<string, unknown> = {
      id: c.id,
      name: c.name,
      country: c.country,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };

    if (wantServices && "services" in c && Array.isArray(c.services)) {
      row.services = c.services.map((s) => ({
        id: s.id,
        service: s.service,
        startDate: s.startDate.toISOString(),
        contractRef: s.contractRef,
      }));
    }

    if (wantTaskCounts && "tasks" in c && Array.isArray(c.tasks)) {
      const tasks = c.tasks as TaskMini[];
      row.taskCounts = {
        urgent: tasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE").length,
        pending: tasks.filter((t) => t.status === "PENDING").length,
        done: tasks.filter((t) => t.status === "DONE").length,
      };
    }

    return row;
  });

  return NextResponse.json(payload);
}
