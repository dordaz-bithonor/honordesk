"use client";

import { useEffect, useMemo, useState } from "react";

import { ClientCard } from "@/components/ClientCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_ORDER, serviceTypeLabel } from "@/lib/service-ui";
import type { ClientListItemDto, ServiceTypeDto } from "@/types";

const serviceOrder = SERVICE_ORDER;

type UniverseViewProps = {
  /** Incrementar para volver a cargar clientes tras crear/editar uno. */
  reloadToken?: number;
};

export function UniverseView({ reloadToken = 0 }: UniverseViewProps) {
  const [clients, setClients] = useState<ClientListItemDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/clients?include=services,taskCounts&status=ACTIVE", {
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/pin";
            return;
          }
          throw new Error(await res.text());
        }
        const data = (await res.json()) as ClientListItemDto[];
        if (!cancelled) setClients(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const byService = useMemo(() => {
    const map = new Map<ServiceTypeDto, ClientListItemDto[]>();
    for (const s of serviceOrder) map.set(s, []);
    if (!clients) return map;
    for (const c of clients) {
      const services = c.services?.length ? c.services.map((x) => x.service) : [];
      const keys = new Set<ServiceTypeDto>(services);
      for (const key of keys) {
        map.get(key)?.push(c);
      }
    }
    return map;
  }, [clients]);

  const kpis = useMemo(() => {
    if (!clients) return null;
    let pending = 0;
    let urgent = 0;
    for (const c of clients) {
      pending += c.taskCounts?.pending ?? 0;
      urgent += c.taskCounts?.urgent ?? 0;
    }
    return {
      clients: clients.length,
      services: new Set(clients.flatMap((c) => c.services?.map((s) => s.service) ?? [])).size,
      pending,
      urgent,
    };
  }, [clients]);

  if (error) {
    return (
      <div className="text-destructive rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
        {error}
      </div>
    );
  }

  if (!clients) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {kpis ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Clientes activos" value={String(kpis.clients)} />
          <KpiCard title="Servicios activos (únicos)" value={String(kpis.services)} />
          <KpiCard title="Tareas pendientes" value={String(kpis.pending)} />
          <KpiCard title="Tareas urgentes" value={String(kpis.urgent)} />
        </div>
      ) : null}

      {serviceOrder.map((service) => {
        const list = byService.get(service) ?? [];
        if (!list.length) return null;
        return (
          <section key={service} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{serviceTypeLabel(service)}</h2>
              <Separator className="flex-1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <ClientCard key={`${service}-${c.id}`} client={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
