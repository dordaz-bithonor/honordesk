import type { PriorityDto, TaskStatusDto } from "@/types";

export const TASK_PRIORITY_OPTIONS: { id: PriorityDto; label: string }[] = [
  { id: "URGENT", label: "Urgente" },
  { id: "HIGH", label: "Alta" },
  { id: "NORMAL", label: "Normal" },
  { id: "LOW", label: "Baja" },
];

export const TASK_STATUS_OPTIONS: { id: TaskStatusDto; label: string }[] = [
  { id: "PENDING", label: "Pendiente" },
  { id: "IN_PROGRESS", label: "En curso" },
  { id: "DONE", label: "Hecha" },
];

export function priorityLabel(id: PriorityDto): string {
  return TASK_PRIORITY_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export function taskStatusLabel(id: TaskStatusDto): string {
  return TASK_STATUS_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
