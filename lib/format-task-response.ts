import type { Client, Task, User } from "@prisma/client";

type TaskWithRelations = Task & {
  client?: Pick<Client, "id" | "name">;
  creator?: Pick<User, "name">;
};

export function formatTaskResponse(t: TaskWithRelations) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    clientId: t.clientId,
    clientName: t.client?.name,
    service: t.service,
    priority: t.priority,
    status: t.status,
    order: t.order,
    backlogOrder: t.backlogOrder,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    createdBy: t.createdBy,
    creatorName: t.creator?.name,
  };
}
