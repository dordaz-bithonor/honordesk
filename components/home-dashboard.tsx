"use client";

import { useState } from "react";

import { CreateClientDialog } from "@/components/create-client-dialog";
import { UniverseView } from "@/components/universe-view";

export function HomeDashboard() {
  const [reloadToken, setReloadToken] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Universo de clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Clientes activos agrupados por servicio.</p>
        </div>
        <CreateClientDialog onCreated={() => setReloadToken((n) => n + 1)} />
      </div>
      <UniverseView reloadToken={reloadToken} />
    </div>
  );
}
