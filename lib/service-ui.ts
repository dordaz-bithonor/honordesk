import type { ClientStatusDto, ServiceTypeDto } from "@/types";

/** Etiquetas de producto (códigos Prisma → nombre Bithonor). */
export const SERVICE_OPTIONS: { id: ServiceTypeDto; label: string }[] = [
  { id: "SPA", label: "Pagos masivos (operadores)" },
  { id: "PAY_IN_OUT", label: "Pagos internacionales (empresas)" },
  { id: "EMPRESAS", label: "OTC corporativo (empresas)" },
  { id: "NOMINA", label: "Nómina" },
];

/** Orden de columnas en el universo (debe incluir todos los `ServiceTypeDto`). */
export const SERVICE_ORDER: ServiceTypeDto[] = SERVICE_OPTIONS.map((o) => o.id);

/** Solo los tres B2B ofrecidos; el alta de cliente no lista Nómina aquí. */
export const BITHONOR_B2B_SERVICE_OPTIONS: { id: ServiceTypeDto; label: string }[] =
  SERVICE_OPTIONS.filter((o) => o.id !== "NOMINA");

export function serviceTypeLabel(id: ServiceTypeDto): string {
  return SERVICE_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

export const CLIENT_STATUS_OPTIONS: { id: ClientStatusDto; label: string }[] = [
  { id: "ACTIVE", label: "Activo" },
  { id: "INACTIVE", label: "Inactivo" },
  { id: "ONBOARDING", label: "Onboarding" },
];
