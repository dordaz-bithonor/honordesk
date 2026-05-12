import Link from "next/link";

import { CountryFlagImg } from "@/components/country-flag-img";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCountryForCard } from "@/lib/supported-markets";
import type { ClientListItemDto } from "@/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? (parts[0]?.[1] ?? "");
  return (a + b).toUpperCase();
}

export function ClientCard({ client }: { client: ClientListItemDto }) {
  const counts = client.taskCounts;
  const { flagCode, label: countryLabel } = formatCountryForCard(client.country);

  return (
    <Link href={`/clients/${client.id}`} className="block transition-opacity hover:opacity-90">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {initials(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base leading-tight">{client.name}</CardTitle>
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              {flagCode ? (
                <CountryFlagImg code={flagCode} size={18} className="shrink-0" />
              ) : (
                <span
                  className="bg-muted text-muted-foreground inline-flex size-[18px] shrink-0 items-center justify-center rounded border border-border/60 text-[10px]"
                  aria-hidden
                >
                  ?
                </span>
              )}
              <span>{countryLabel}</span>
            </p>
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
        </CardContent>
      </Card>
    </Link>
  );
}
