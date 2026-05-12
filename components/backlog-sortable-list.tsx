"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { BacklogTaskCard } from "@/components/backlog-task-card";
import { cn } from "@/lib/utils";
import type { TaskListItemDto, TaskStatusDto } from "@/types";

function SortableRow({
  task,
  patchStatus,
}: {
  task: TaskListItemDto;
  patchStatus: (taskId: string, status: TaskStatusDto) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    animateLayoutChanges: () => false,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn("list-none", isDragging && "relative z-50 opacity-90")}
    >
      <BacklogTaskCard
        task={task}
        onStatusChange={patchStatus}
        leading={
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground flex touch-none items-center justify-center rounded-md border border-transparent p-1"
            aria-label="Arrastrar para reordenar prioridad"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4 shrink-0" />
          </button>
        }
      />
    </li>
  );
}

type Props = {
  tasks: TaskListItemDto[];
  patchStatus: (taskId: string, status: TaskStatusDto) => void;
  onReordered: () => Promise<void>;
  onReorderError?: (message: string) => void;
};

export function BacklogSortableList({ tasks, patchStatus, onReordered, onReorderError }: Props) {
  const [orderedTasks, setOrderedTasks] = useState<TaskListItemDto[]>(tasks);
  const tasksRef = useRef(tasks);

  useEffect(() => {
    tasksRef.current = tasks;
    startTransition(() => {
      setOrderedTasks(tasks);
    });
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedTasks.findIndex((t) => t.id === active.id);
    const newIndex = orderedTasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextOrdered = arrayMove(orderedTasks, oldIndex, newIndex);
    const nextIds = nextOrdered.map((t) => t.id);
    setOrderedTasks(nextOrdered);

    const res = await fetch("/api/tasks/reorder", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: nextIds }),
    });
    if (res.ok) {
      await onReordered();
      return;
    }
    let msg = "No se pudo guardar el orden";
    try {
      const j = (await res.json()) as { error?: string };
      if (typeof j.error === "string") msg = j.error;
    } catch {
      /* keep default */
    }
    onReorderError?.(msg);
    setOrderedTasks(tasksRef.current);
    await onReordered();
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => void handleDragEnd(e)}>
      <SortableContext items={orderedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex w-full min-w-0 flex-col gap-3">
          {orderedTasks.map((t) => (
            <SortableRow key={t.id} task={t} patchStatus={patchStatus} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
