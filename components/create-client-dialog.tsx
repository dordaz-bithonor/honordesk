"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarketSelect } from "@/components/market-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BITHONOR_B2B_SERVICE_OPTIONS } from "@/lib/service-ui";
import type { ServiceTypeDto } from "@/types";

type Props = {
  onCreated?: () => void;
};

export function CreateClientDialog({ onCreated }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [selected, setSelected] = useState<Set<ServiceTypeDto>>(() => new Set(["SPA"]));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleService(id: ServiceTypeDto, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function reset() {
    setName("");
    setCountry("");
    setSelected(new Set(["SPA"]));
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (selected.size === 0) {
      setError("Selecciona al menos un servicio.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          country,
          services: [...selected],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "No se pudo crear el cliente");
        return;
      }
      const newId = typeof data.id === "string" ? data.id : null;
      setOpen(false);
      reset();
      onCreated?.();
      if (newId) {
        router.push(`/clients/${newId}`);
      }
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Nuevo cliente
      </Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Nuevo cliente</DialogTitle>
              <DialogDescription>Nombre, país y al menos un servicio. Luego podrás editar el resto en el detalle.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="cc-name">Nombre</Label>
                <Input id="cc-name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="organization" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cc-country">País</Label>
                <MarketSelect
                  id="cc-country"
                  value={country}
                  onValueChange={setCountry}
                  required
                  className="max-w-none"
                />
              </div>
              <div className="grid gap-2">
                <Label>Servicios</Label>
                <div className="grid gap-2">
                  {BITHONOR_B2B_SERVICE_OPTIONS.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected.has(opt.id)}
                        onCheckedChange={(v) => toggleService(opt.id, v === true)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              {error ? <p className="text-destructive text-sm">{error}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando…" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
