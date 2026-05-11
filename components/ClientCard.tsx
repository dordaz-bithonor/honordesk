import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientListItemDto, ServiceTypeDto } from "@/types";

const serviceLabels: Record<ServiceTypeDto, string> = {
  SPA: "SPA",
  PAY_IN_OUT: "Pay In/Out",
  EMPRESAS: "Empresas",
  NOMINA: "Nómina",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? (parts[0]?.[1] ?? "");
  return (a + b).toUpperCase();
}

export function ClientCard({ client }: { client: ClientListItemDto }) {
  const counts = client.taskCounts;

  return (
    <Link href={`/clients/${client.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {initials(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base leading-tight">{client.name}</CardTitle>
            <p className="text-muted-foreground text-xs">{client.country}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {counts ? (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-400">Urgentes: {counts.urgent}</span>
              <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-blue-700 dark:text-blue-400">Pendientes: {counts.pending}</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">Hechas: {counts.done}</span>
            </div>
          ) : null}
          {client.services?.length ? (
            <div className="flex flex-wrap gap-1">
              {client.services.map((s) => (
                <span
                  key={s.id}
                  className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium"
                >
                  {serviceLabels[s.service]}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
