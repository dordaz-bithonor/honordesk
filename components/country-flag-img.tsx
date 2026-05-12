"use client";

import { useState } from "react";

import { marketFlagImageUrl, type MarketCode } from "@/lib/supported-markets";
import { cn } from "@/lib/utils";

type Props = {
  code: MarketCode;
  size?: number;
  className?: string;
};

/** Bandera como imagen (flagcdn); los emoji de bandera suelen fallar en Windows. */
export function CountryFlagImg({ code, size = 18, className }: Props) {
  const [broken, setBroken] = useState(false);
  const w = Math.max(32, Math.round(size * 2.2));

  if (broken) {
    return (
      <span
        className={cn(
          "bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center rounded border border-border/60 font-mono text-[9px] font-semibold uppercase",
          className
        )}
        style={{ width: size * 1.35, height: size }}
        aria-hidden
      >
        {code}
      </span>
    );
  }

  return (
    // Bandera remota pequeña; `<Image>` añade poco y flagcdn ya sirve PNG livianos.
    // eslint-disable-next-line @next/next/no-img-element -- emoji flags break on Windows
    <img
      src={marketFlagImageUrl(code, w)}
      width={Math.round(size * 1.35)}
      height={size}
      alt=""
      className={cn("shrink-0 rounded-sm border border-border/60 object-cover shadow-sm", className)}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
