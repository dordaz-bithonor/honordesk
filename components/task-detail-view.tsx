"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { serviceTypeLabel } from "@/lib/service-ui";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/task-ui";
import type { PriorityDto, ServiceTypeDto, TaskDetailDto, TaskStatusDto } from "@/types";

type Props = {
  taskId: string;
};

export function TaskDetailView({ taskId }: Props) {
  const [task, setTask] = useState<TaskDetailDto | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [service, setService] = useState<ServiceTypeDto>("SPA");
  const [priority, setPriority] = useState<PriorityDto>("NORMAL");
  const [status, setStatus] = useState<TaskStatusDto>("PENDING");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/pin";
        return;
      }
      if (res.status === 404) {
        setTask(null);
        setLoadError("Solicitud no encontrada.");
        return;
      }
      if (!res.ok) {
        setLoadError(await res.text());
        return;
      }
      const data = (await res.json()) as TaskDetailDto;
      setTask(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setService(data.service);
      setPriority(data.priority);
      setStatus(data.status);
    } catch {
      setLoadError("Error al cargar la solicitud");
    }
  }, [taskId]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const t = title.trim();
    if (!t) {
      setSaveError("El título es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          description: description.trim() === "" ? null : description.trim(),
          ...(task.allowedServices.length > 0 ? { service } : {}),
          priority,
          status,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setSaveError(body.error ?? "No se pudo guardar");
        return;
      }
      await load();
    } catch {
      setSaveError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  if (loadError && !task) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <p className="text-destructive text-sm">{loadError}</p>
        <Link href="/backlog" className={cn(buttonVariants({ variant: "outline" }))}>
          Volver al backlog
        </Link>
      </div>
    );
  }

  if (!task) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>;
  }

  const canPickService = task.allowedServices.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Link href="/backlog" className="text-primary hover:underline">
            Backlog
          </Link>
          <span aria-hidden>·</span>
          <Link href={`/clients/${task.clientId}`} className="text-primary hover:underline">
            {task.clientName ?? "Cliente"}
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Solicitud</h1>
        <p className="text-muted-foreground text-sm">
          Creada{" "}
          {new Date(task.createdAt).toLocaleString("es-CL", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {task.creatorName ? ` · ${task.creatorName}` : null}
        </p>
      </div>

      <form onSubmit={(e) => void onSave(e)} className="bg-muted/30 space-y-5 rounded-xl border p-5">
        <div className="grid gap-2">
          <Label htmlFor="td-title">Título</Label>
          <Input id="td-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="td-desc">Descripción</Label>
          <Textarea
            id="td-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Contexto, enlaces o criterios"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="td-svc">Servicio</Label>
            {canPickService ? (
              <select
                id="td-svc"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                value={service}
                onChange={(e) => setService(e.target.value as ServiceTypeDto)}
              >
                {task.allowedServices.map((s) => (
                  <option key={s} value={s}>
                    {serviceTypeLabel(s)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-muted-foreground text-sm">
                {serviceTypeLabel(task.service)} (el cliente no tiene servicios contratados en el sistema)
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="td-pri">Prioridad</Label>
            <select
              id="td-pri"
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
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="td-st">Estado</Label>
            <select
              id="td-st"
              className="border-input bg-background h-9 w-full max-w-md rounded-md border px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatusDto)}
            >
              {TASK_STATUS_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {saveError ? <p className="text-destructive text-sm">{saveError}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
          <Link href="/backlog" className={cn(buttonVariants({ variant: "outline" }), "inline-flex items-center justify-center")}>
            Cerrar
          </Link>
        </div>
      </form>

      <p className="text-muted-foreground text-xs">
        Última actualización en servidor: {new Date(task.updatedAt).toLocaleString("es-CL")}
      </p>
    </div>
  );
}
