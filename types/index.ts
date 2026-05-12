export type ClientStatusDto = "ACTIVE" | "INACTIVE" | "ONBOARDING";

export type ServiceTypeDto = "SPA" | "PAY_IN_OUT" | "EMPRESAS" | "NOMINA";

export type PriorityDto = "URGENT" | "HIGH" | "NORMAL" | "LOW";

export type TaskStatusDto = "PENDING" | "IN_PROGRESS" | "DONE";

/** Tarea en listados (detalle cliente y backlog central). */
export type TaskListItemDto = {
  id: string;
  title: string;
  description: string | null;
  clientId: string;
  clientName?: string;
  service: ServiceTypeDto;
  priority: PriorityDto;
  status: TaskStatusDto;
  order: number;
  backlogOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  creatorName?: string;
};

/** Tarea con servicios permitidos para el formulario de edición (GET `/api/tasks/[id]`). */
export type TaskDetailDto = TaskListItemDto & {
  allowedServices: ServiceTypeDto[];
};

export type ClientTaskCountsDto = {
  urgent: number;
  pending: number;
  done: number;
};

export type ClientServiceDto = {
  id: string;
  service: ServiceTypeDto;
  startDate: string;
  contractRef: string | null;
};

export type ClientListItemDto = {
  id: string;
  name: string;
  country: string;
  status: ClientStatusDto;
  createdAt: string;
  updatedAt: string;
  services?: ClientServiceDto[];
  taskCounts?: ClientTaskCountsDto;
};

/** Respuesta de GET/PATCH `/api/clients/[id]` */
export type ClientDetailDto = ClientListItemDto & {
  notes: string | null;
  services: ClientServiceDto[];
  taskCounts: ClientTaskCountsDto;
};
