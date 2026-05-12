"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useState } from "react";

import { ClientBacklogSection } from "@/components/client-backlog-section";
import { MarketSelect } from "@/components/market-select";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CLIENT_STATUS_OPTIONS, SERVICE_OPTIONS } from "@/lib/service-ui";
import type { ClientDetailDto, ClientStatusDto, ServiceTypeDto } from "@/types";

type FormState = {
  name: string;
  country: string;
  status: ClientStatusDto;
  notes: string;
  services: Set<ServiceTypeDto>;
};

export function ClientDetailView({ id }: { id: string }) {
  const [client, setClient] = useState<ClientDetailDto | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setClient(null);
    setForm(null);
    setLoadError(null);
    try {
      const res = await fetch(`/api/clients/${id}`, { credentials: "include" });
      if (res.status === 401) {
        window.location.href = "/pin";
        return;
      }
      if (res.status === 404) {
        setLoadError("Cliente no encontrado.");
        return;
      }
      if (!res.ok) {
        setLoadError(await res.text());
        return;
      }
      const c = (await res.json()) as ClientDetailDto;
      setClient(c);
      setForm({
        name: c.name,
        country: c.country,
        status: c.status,
        notes: c.notes ?? "",
        services: new Set(c.services.map((s) => s.service)),
      });
    } catch {
      setLoadError("Error al cargar el cliente.");
    }
  }, [id]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  function toggleService(svc: ServiceTypeDto, checked: boolean) {
    setForm((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.services);
      if (checked) next.add(svc);
      else next.delete(svc);
      return { ...prev, services: next };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaveError(null);
    if (form.services.size === 0) {
      setSaveError("Debes mantener al menos un servicio.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          country: form.country.trim(),
          status: form.status,
          notes: form.notes.trim() === "" ? null : form.notes.trim(),
          services: [...form.services],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as ClientDetailDto & { error?: string };
      if (!res.ok) {
        setSaveError(data.error ?? "No se pudo guardar");
        return;
      }
      const updated = data as ClientDetailDto;
      setClient(updated);
      setForm({
        name: updated.name,
        country: updated.country,
        status: updated.status,
        notes: updated.notes ?? "",
        services: new Set(updated.services.map((s) => s.service)),
      });
    } catch {
      setSaveError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <div className="w-full space-y-4">
        <p className="text-destructive text-sm">{loadError}</p>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Volver al universo
        </Link>
      </div>
    );
  }

  if (!client || !form) {
    return (
      <div className="w-full space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const counts = client.taskCounts;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          ← Universo
        </Link>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
        <p className="text-muted-foreground font-mono text-xs break-all">{client.id}</p>
      </header>

      <Tabs defaultValue="general" className="w-full min-w-0 gap-0">
        <TabsList
          variant="line"
          className="mb-6 h-auto w-full min-w-0 justify-start gap-0 rounded-none border-0 border-b border-border bg-transparent p-0 pb-px"
        >
          <TabsTrigger value="general" className="rounded-none px-4 py-2.5 data-active:after:bottom-0">
            General
          </TabsTrigger>
          <TabsTrigger value="backlog" className="rounded-none px-4 py-2.5 data-active:after:bottom-0">
            Backlog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 w-full min-w-0 space-y-6">
          {counts ? (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-400">
                Urgentes: {counts.urgent}
              </span>
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-blue-700 dark:text-blue-400">
                Pendientes: {counts.pending}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                Hechas: {counts.done}
              </span>
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="grid min-w-0 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cd-name">Nombre</Label>
                  <Input
                    id="cd-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
                    required
                    className="w-full"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cd-country">País</Label>
                  <MarketSelect
                    id="cd-country"
                    value={form.country}
                    onValueChange={(code) => setForm((f) => (f ? { ...f, country: code } : f))}
                    required
                    className="max-w-none"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cd-status">Estado</Label>
                  <select
                    id="cd-status"
                    className="border-input bg-background h-9 w-full max-w-md rounded-md border px-3 text-sm lg:max-w-none"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, status: e.target.value as ClientStatusDto } : f))
                    }
                  >
                    {CLIENT_STATUS_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid min-w-0 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cd-notes">Notas internas</Label>
                  <Textarea
                    id="cd-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => (f ? { ...f, notes: e.target.value } : f))}
                    rows={6}
                    placeholder="Opcional"
                    className="min-h-[140px] w-full resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Servicios contratados</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SERVICE_OPTIONS.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={form.services.has(opt.id)}
                          onCheckedChange={(v) => toggleService(opt.id, v === true)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {saveError ? <p className="text-destructive text-sm">{saveError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className={cn(buttonVariants({ variant: "default" }), saving && "opacity-70")}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void load()}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Descartar cambios
              </button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="backlog" className="mt-0 w-full min-w-0">
          <ClientBacklogSection
            clientId={client.id}
            contractedServices={client.services.map((s) => s.service)}
            onTasksMutated={() => void load()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
