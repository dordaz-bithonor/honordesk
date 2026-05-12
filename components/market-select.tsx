"use client";

import { SUPPORTED_MARKETS } from "@/lib/supported-markets";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string;
  onValueChange: (code: string) => void;
  required?: boolean;
  className?: string;
};

export function MarketSelect({ id, value, onValueChange, required, className }: Props) {
  const known = SUPPORTED_MARKETS.some((m) => m.code === value);
  return (
    <select
      id={id}
      required={required}
      value={known || value ? value : ""}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "border-input bg-background h-9 w-full max-w-xs rounded-md border px-3 text-sm",
        className
      )}
    >
      <option value="" disabled={required}>
        {required ? "Seleccionar país…" : "—"}
      </option>
      {SUPPORTED_MARKETS.map((m) => (
        <option key={m.code} value={m.code}>
          {m.flag} {m.label}
        </option>
      ))}
      {value && !known ? (
        <option value={value}>{value} (actual, sin bandera en catálogo)</option>
      ) : null}
    </select>
  );
}
