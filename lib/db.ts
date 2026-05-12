import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/**
 * PgBouncer en modo transacción (p. ej. Supabase `:6543` / host `pooler.*`) no mezcla bien
 * las sentencias preparadas de Prisma → Postgres `42P05 prepared statement "sN" already exists`.
 * `pgbouncer=true` hace que Prisma no use prepared statements en esa URL.
 * @see https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
 */
function databaseUrlForRuntime(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const lower = url.toLowerCase();
  if (lower.includes("pgbouncer=true")) return url;
  const viaTransactionPooler =
    lower.includes("pooler.") || /:6543([/?#]|$)/i.test(url);
  if (!viaTransactionPooler) return url;
  return url.includes("?") ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`;
}

const runtimeDbUrl = databaseUrlForRuntime();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeDbUrl
      ? { datasources: { db: { url: runtimeDbUrl } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
