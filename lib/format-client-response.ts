import type { Client, ClientService, Priority, ServiceType, TaskStatus } from "@prisma/client";

export type ClientWithOptionalRelations = Client & {
  services?: ClientService[];
  tasks?: { priority: Priority; status: TaskStatus }[];
};

export function formatClientResponse(
  c: ClientWithOptionalRelations,
  opts: { services: boolean; taskCounts: boolean; notes?: boolean }
): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: c.id,
    name: c.name,
    country: c.country,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };

  if (opts.notes) {
    row.notes = c.notes ?? null;
  }

  if (opts.services && c.services) {
    row.services = c.services.map((s) => ({
      id: s.id,
      service: s.service as ServiceType,
      startDate: s.startDate.toISOString(),
      contractRef: s.contractRef,
    }));
  }

  if (opts.taskCounts && c.tasks) {
    const tasks = c.tasks;
    row.taskCounts = {
      urgent: tasks.filter((t) => t.priority === "URGENT" && t.status !== "DONE").length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      done: tasks.filter((t) => t.status === "DONE").length,
    };
  }

  return row;
}
