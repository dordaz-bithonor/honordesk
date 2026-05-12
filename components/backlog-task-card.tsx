"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { serviceTypeLabel } from "@/lib/service-ui";
import { TASK_STATUS_OPTIONS, priorityLabel } from "@/lib/task-ui";
import type { TaskListItemDto, TaskStatusDto } from "@/types";

type Props = {
  task: TaskListItemDto;
  onStatusChange: (taskId: string, status: TaskStatusDto) => void;
  /** Kanban / roadmap: menos metadatos visibles */
  compact?: boolean;
  /** Arrastrar en lista (asas con listeners en el padre) */
  leading?: ReactNode;
};

export function BacklogTaskCard({ task, onStatusChange, compact, leading }: Props) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex gap-2 p-3 text-sm">
        {leading ? <div className="flex shrink-0 flex-col pt-0.5">{leading}</div> : null}
        <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <Link
            href={`/clients/${task.clientId}`}
            className="text-primary text-xs font-medium hover:underline"
          >
            {task.clientName ?? task.clientId}
          </Link>
          {!compact ? (
            <span className="text-muted-foreground text-xs whitespace-nowrap">
              {new Date(task.createdAt).toLocaleString("es-CL", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : null}
        </div>
        <Link
          href={`/tasks/${task.id}`}
          className="font-medium leading-snug hover:underline"
        >
          {task.title}
        </Link>
        {task.description && !compact ? (
          <Link
            href={`/tasks/${task.id}`}
            className="text-muted-foreground line-clamp-3 block text-xs hover:underline"
          >
            {task.description}
          </Link>
        ) : null}
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-muted rounded px-1.5 py-0.5">{serviceTypeLabel(task.service)}</span>
          <span>{priorityLabel(task.priority)}</span>
          {task.creatorName ? <span>· {task.creatorName}</span> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <label className="sr-only" htmlFor={`bl-st-${task.id}`}>
            Estado
          </label>
          <select
            id={`bl-st-${task.id}`}
            className="border-input bg-background h-8 max-w-full rounded-md border px-2 text-xs"
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatusDto)}
          >
            {TASK_STATUS_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
