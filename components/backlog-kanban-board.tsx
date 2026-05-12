"use client";

import type { ReactNode } from "react";
import { startTransition, useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { BacklogTaskCard } from "@/components/backlog-task-card";
import { TASK_STATUS_OPTIONS, taskStatusLabel } from "@/lib/task-ui";
import { cn } from "@/lib/utils";
import type { TaskListItemDto, TaskStatusDto } from "@/types";

function KanbanColumn({
  status,
  count,
  children,
}: {
  status: TaskStatusDto;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `kanban-col-${status}`,
    data: { type: "column" as const, status },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-muted/20 flex min-h-[220px] min-w-0 flex-col gap-3 rounded-xl border p-3 transition-shadow",
        isOver && "ring-primary ring-2 ring-offset-2 ring-offset-background"
      )}
    >
      <h2 className="text-sm font-semibold">
        {taskStatusLabel(status)}{" "}
        <span className="text-muted-foreground font-normal">({count})</span>
      </h2>
      <div className="flex min-h-[120px] flex-col gap-2">{children}</div>
    </div>
  );
}

function DraggableKanbanCard({
  task,
  patchStatus,
}: {
  task: TaskListItemDto;
  patchStatus: (taskId: string, status: TaskStatusDto) => Promise<boolean>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task" as const, status: task.status },
  });
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "relative z-50 opacity-80")}>
      <BacklogTaskCard
        task={task}
        onStatusChange={patchStatus}
        compact
        leading={
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground flex touch-none items-center justify-center rounded-md p-1"
            aria-label="Arrastrar a otra columna"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4 shrink-0" />
          </button>
        }
      />
    </div>
  );
}

type Props = {
  tasks: TaskListItemDto[];
  patchStatus: (taskId: string, status: TaskStatusDto) => Promise<boolean>;
};

export function BacklogKanbanBoard({ tasks, patchStatus }: Props) {
  const [localTasks, setLocalTasks] = useState<TaskListItemDto[]>(tasks);
  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
    startTransition(() => {
      setLocalTasks(tasks);
    });
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const activeTask = localTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const overData = over.data.current as { type?: string; status?: TaskStatusDto } | undefined;
    let nextStatus: TaskStatusDto | null = null;
    if (overData?.type === "column" && overData.status) {
      nextStatus = overData.status;
    } else if (overData?.type === "task" && overData.status) {
      nextStatus = overData.status;
    }

    if (nextStatus && nextStatus !== activeTask.status) {
      setLocalTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: nextStatus! } : t))
      );
      void (async () => {
        const ok = await patchStatus(activeId, nextStatus!);
        if (!ok) {
          setLocalTasks(tasksRef.current);
        }
      })();
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid w-full min-w-0 gap-4 md:grid-cols-3">
        {TASK_STATUS_OPTIONS.map((col) => {
          const colTasks = localTasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn key={col.id} status={col.id} count={colTasks.length}>
              {colTasks.map((t) => (
                <DraggableKanbanCard key={t.id} task={t} patchStatus={patchStatus} />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
}
