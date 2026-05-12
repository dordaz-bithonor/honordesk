"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";

import { BacklogKanbanBoard } from "@/components/backlog-kanban-board";
import { BacklogSortableList } from "@/components/backlog-sortable-list";
import { BacklogTaskCard } from "@/components/backlog-task-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { weekRoadmapKey, weekRoadmapLabel } from "@/lib/backlog-roadmap";
import { SERVICE_OPTIONS } from "@/lib/service-ui";
import { TASK_STATUS_OPTIONS } from "@/lib/task-ui";
import { cn } from "@/lib/utils";
import type { ClientListItemDto, ServiceTypeDto, TaskListItemDto, TaskStatusDto } from "@/types";

type ViewMode = "list" | "kanban" | "roadmap";

export function BacklogCentralView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [clientFilter, setClientFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceTypeDto | "">("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatusDto>("all");

  const [tasks, setTasks] = useState<TaskListItemDto[] | null>(null);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const tasksUrl = useMemo(() => {
    const q = new URLSearchParams();
    if (clientFilter) q.set("clientId", clientFilter);
    if (serviceFilter) q.set("service", serviceFilter);
    if (statusFilter !== "all") q.set("status", statusFilter);
    const qs = q.toString();
    return `/api/tasks${qs ? `?${qs}` : ""}`;
  }, [clientFilter, serviceFilter, statusFilter]);

  const loadTasks = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(tasksUrl, { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/pin";
        return;
      }
      if (!res.ok) {
        setError(await res.text());
        return;
      }
      setTasks((await res.json()) as TaskListItemDto[]);
    } catch {
      setError("Error al cargar el backlog");
    }
  }, [tasksUrl]);

  useEffect(() => {
    startTransition(() => {
      void loadTasks();
    });
  }, [loadTasks]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("/api/clients?status=ACTIVE", { credentials: "include" });
        if (res.status === 401) return;
        if (!res.ok) return;
        const data = (await res.json()) as ClientListItemDto[];
        setClients(data.map((c) => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name)));
      } catch {
        /* noop */
      }
    }
    void loadClients();
  }, []);

  async function patchStatus(taskId: string, status: TaskStatusDto): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await loadTasks();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  const roadmapColumns = useMemo(() => {
    if (!tasks?.length) return [] as { key: string; label: string; items: TaskListItemDto[] }[];
    const map = new Map<string, TaskListItemDto[]>();
    for (const t of tasks) {
      const key = weekRoadmapKey(t.createdAt);
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    const keys = [...map.keys()].sort((a, b) => a.localeCompare(b));
    return keys.map((key) => ({
      key,
      label: weekRoadmapLabel(map.get(key)![0]!.createdAt),
      items: (map.get(key) ?? []).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    }));
  }, [tasks]);

  const selectClass =
    "border-input bg-background h-9 w-full min-w-0 rounded-md border px-3 text-sm md:max-w-[220px]";

  const filtersActive = Boolean(clientFilter || serviceFilter || statusFilter !== "all");

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Backlog centralizado</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Solicitudes de todos los clientes. Crea nuevas desde el detalle de cada cliente.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadTasks()}>
          Actualizar
        </Button>
      </div>

      <div className="bg-muted/30 flex flex-wrap gap-2 rounded-lg border p-1">
        {(
          [
            ["list", "Lista"],
            ["kanban", "Kanban"],
            ["roadmap", "Roadmap"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={viewMode === id ? "default" : "ghost"}
            className={cn(viewMode === id && "shadow-sm")}
            onClick={() => setViewMode(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 border-b pb-6 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="bl-filter-client">Cliente</Label>
          <select
            id="bl-filter-client"
            className={selectClass}
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="">Todos los clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bl-filter-service">Servicio</Label>
          <select
            id="bl-filter-service"
            className={selectClass}
            value={serviceFilter}
            onChange={(e) => setServiceFilter((e.target.value || "") as ServiceTypeDto | "")}
          >
            <option value="">Todos los servicios</option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bl-filter-status">Estado</Label>
          <select
            id="bl-filter-status"
            className={selectClass}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatusDto)}
          >
            <option value="all">Todos los estados</option>
            {TASK_STATUS_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="text-destructive rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {error}
        </div>
      ) : null}

      {tasks === null ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No hay solicitudes con estos filtros. Prueba ampliar filtros o crea una desde un cliente.
        </p>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filtersActive ? (
            <p className="text-muted-foreground text-sm">
              Con filtros activos el orden global no aplica. Quita cliente, servicio y estado para
              reordenar la lista con el asa ⋮⋮ a la izquierda de cada tarjeta.
            </p>
          ) : null}
          {filtersActive ? (
            <ul className="flex w-full min-w-0 flex-col gap-3">
              {tasks.map((t) => (
                <li key={t.id} className="list-none">
                  <BacklogTaskCard task={t} onStatusChange={patchStatus} />
                </li>
              ))}
            </ul>
          ) : (
            <BacklogSortableList
              tasks={tasks}
              patchStatus={patchStatus}
              onReordered={loadTasks}
              onReorderError={(msg) => setError(msg)}
            />
          )}
        </div>
      ) : viewMode === "kanban" ? (
        <BacklogKanbanBoard tasks={tasks} patchStatus={patchStatus} />
      ) : (
        <div className="flex w-full min-w-0 gap-4 overflow-x-auto pb-2">
          {roadmapColumns.map((col) => (
            <div
              key={col.key}
              className="bg-muted/20 flex w-[min(100%,280px)] shrink-0 flex-col gap-3 rounded-xl border p-3 md:w-72"
            >
              <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Semana
              </h2>
              <p className="text-sm font-medium">{col.label}</p>
              <div className="flex flex-col gap-2">
                {col.items.map((t) => (
                  <BacklogTaskCard key={t.id} task={t} onStatusChange={patchStatus} compact />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
