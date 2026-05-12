"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { serviceTypeLabel } from "@/lib/service-ui";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS, priorityLabel } from "@/lib/task-ui";
import type { PriorityDto, ServiceTypeDto, TaskListItemDto, TaskStatusDto } from "@/types";

type Props = {
  clientId: string;
  /** Servicios contratados del cliente (solo esos se pueden elegir al crear tarea). */
  contractedServices: ServiceTypeDto[];
  onTasksMutated?: () => void;
};

export function ClientBacklogSection({ clientId, contractedServices, onTasksMutated }: Props) {
  const [tasks, setTasks] = useState<TaskListItemDto[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [service, setService] = useState<ServiceTypeDto | undefined>(undefined);
  const [priority, setPriority] = useState<PriorityDto>("NORMAL");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/tasks?clientId=${encodeURIComponent(clientId)}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        window.location.href = "/pin";
        return;
      }
      if (!res.ok) {
        setLoadError(await res.text());
        return;
      }
      setTasks((await res.json()) as TaskListItemDto[]);
    } catch {
      setLoadError("Error al cargar el backlog");
    }
  }, [clientId]);

  useEffect(() => {
    startTransition(() => {
      void loadTasks();
    });
  }, [loadTasks]);

  const resolvedService: ServiceTypeDto | undefined =
    service && contractedServices.includes(service) ? service : contractedServices[0];

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError("Indica un título.");
      return;
    }
    if (!resolvedService) {
      setFormError("El cliente debe tener al menos un servicio contratado.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          title: title.trim(),
          description: description.trim() || undefined,
          service: resolvedService,
          priority,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFormError(data.error ?? "No se pudo crear la solicitud");
        return;
      }
      setTitle("");
      setDescription("");
      await loadTasks();
      onTasksMutated?.();
    } catch {
      setFormError("Error de red");
    } finally {
      setSubmitting(false);
    }
  }

  async function patchTaskStatus(taskId: string, status: TaskStatusDto) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      await loadTasks();
      onTasksMutated?.();
    } catch {
      /* noop */
    }
  }

  const canCreate = contractedServices.length > 0;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Solicitudes</h2>
        <p className="text-muted-foreground text-sm">
          Las solicitudes se guardan en el mismo backlog que ves en{" "}
          <Link href="/backlog" className="text-primary font-medium underline-offset-4 hover:underline">
            Backlog centralizado
          </Link>
          .
        </p>
      </div>

      {canCreate ? (
        <form onSubmit={onCreate} className="bg-muted/40 space-y-4 rounded-xl border p-4">
          <p className="text-sm font-medium">Nueva solicitud</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="cb-title">Título</Label>
              <Input
                id="cb-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Revisar límite de operación"
                required
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="cb-desc">Descripción (opcional)</Label>
              <Textarea
                id="cb-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Contexto o criterios de aceptación"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cb-svc">Servicio</Label>
              <select
                id="cb-svc"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={resolvedService ?? ""}
                onChange={(e) => setService(e.target.value as ServiceTypeDto)}
              >
                {contractedServices.map((s) => (
                  <option key={s} value={s}>
                    {serviceTypeLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cb-pri">Prioridad</Label>
              <select
                id="cb-pri"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityDto)}
              >
                {TASK_PRIORITY_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formError ? <p className="text-destructive text-sm">{formError}</p> : null}
          <button type="submit" disabled={submitting} className={cn(buttonVariants())}>
            {submitting ? "Creando…" : "Añadir al backlog"}
          </button>
        </form>
      ) : (
        <p className="text-muted-foreground text-sm">
          Añade al menos un servicio contratado al cliente para poder crear solicitudes.
        </p>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Solicitudes de este cliente</h3>
        {loadError ? <p className="text-destructive text-sm">{loadError}</p> : null}
        {tasks === null ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aún no hay solicitudes.</p>
        ) : (
          <ul className="divide-border divide-y rounded-xl border">
            {tasks.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <Link href={`/tasks/${t.id}`} className="font-medium hover:underline">
                    {t.title}
                  </Link>
                  {t.description ? (
                    <p className="text-muted-foreground line-clamp-2 text-xs">{t.description}</p>
                  ) : null}
                  <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                    <span>{serviceTypeLabel(t.service)}</span>
                    <span>·</span>
                    <span>{priorityLabel(t.priority)}</span>
                    {t.creatorName ? (
                      <>
                        <span>·</span>
                        <span>{t.creatorName}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0">
                  <label className="sr-only" htmlFor={`cb-st-${t.id}`}>
                    Estado
                  </label>
                  <select
                    id={`cb-st-${t.id}`}
                    className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                    value={t.status}
                    onChange={(e) => void patchTaskStatus(t.id, e.target.value as TaskStatusDto)}
                  >
                    {TASK_STATUS_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
