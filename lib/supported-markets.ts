/** Mercados soportados en UI (código guardado en `Client.country`). */
export const SUPPORTED_MARKETS = [
  { code: "CL", label: "Chile", flag: "🇨🇱" },
  { code: "AR", label: "Argentina", flag: "🇦🇷" },
  { code: "ES", label: "España", flag: "🇪🇸" },
  { code: "EU", label: "Unión Europea", flag: "🇪🇺" },
  { code: "CO", label: "Colombia", flag: "🇨🇴" },
  { code: "BR", label: "Brasil", flag: "🇧🇷" },
  { code: "MX", label: "México", flag: "🇲🇽" },
  { code: "US", label: "Estados Unidos", flag: "🇺🇸" },
  { code: "PE", label: "Perú", flag: "🇵🇪" },
] as const;

export type MarketCode = (typeof SUPPORTED_MARKETS)[number]["code"];

const byCode = Object.fromEntries(SUPPORTED_MARKETS.map((m) => [m.code, m])) as Record<
  MarketCode,
  (typeof SUPPORTED_MARKETS)[number]
>;

/** Normaliza texto para comparar nombres (sin tildes, minúsculas). */
function fold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

const nameAliases: Record<string, MarketCode> = {
  cl: "CL",
  chile: "CL",
  ar: "AR",
  argentina: "AR",
  es: "ES",
  espana: "ES",
  spain: "ES",
  eu: "EU",
  ue: "EU",
  "union europea": "EU",
  "european union": "EU",
  co: "CO",
  colombia: "CO",
  br: "BR",
  brasil: "BR",
  brazil: "BR",
  mx: "MX",
  mexico: "MX",
  us: "US",
  usa: "US",
  "estados unidos": "US",
  "united states": "US",
  pe: "PE",
  peru: "PE",
};

export function isMarketCode(value: string): value is MarketCode {
  return value.toUpperCase() in byCode;
}

export function getMarketByCode(code: string): (typeof SUPPORTED_MARKETS)[number] | null {
  const up = code.trim().toUpperCase();
  return byCode[up as MarketCode] ?? null;
}

/** Resuelve código ISO2 / alias de nombre → mercado conocido, o null. */
export function resolveMarket(input: string): (typeof SUPPORTED_MARKETS)[number] | null {
  const t = input.trim();
  if (!t) return null;
  const byIso = getMarketByCode(t);
  if (byIso) return byIso;
  const prefix = t.match(/^([A-Za-z]{2})\b/);
  if (prefix) {
    const m = getMarketByCode(prefix[1]);
    if (m) return m;
  }
  const key = fold(t);
  const code = nameAliases[key];
  return code ? byCode[code] : null;
}

/** URL de bandera (PNG) compatible con Windows; ver https://flagcdn.com */
export function marketFlagImageUrl(code: MarketCode, widthPx = 40): string {
  return `https://flagcdn.com/w${widthPx}/${code.toLowerCase()}.png`;
}

/** Para tarjetas del universo: imagen de bandera + etiqueta (sin depender de emoji). */
export function formatCountryForCard(country: string): {
  flagCode: MarketCode | null;
  label: string;
} {
  const m = resolveMarket(country);
  if (m) return { flagCode: m.code, label: m.label };
  return { flagCode: null, label: country.trim() || "—" };
}
