import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

const FALLBACK_SYSTEM_EMAIL = "honordesk-sistema@internal.local";

/**
 * Las tareas requieren `createdBy`. Se usa el primer usuario existente (p. ej. del seed).
 * Si no hay ninguno, se crea un usuario interno mínimo para que crear solicitudes funcione
 * sin depender de haber ejecutado `npm run db:seed`.
 *
 * Opcional: `HONORDESK_SYSTEM_USER_EMAIL` en `.env.local` para fijar el email de ese usuario.
 */
export async function getDefaultTaskCreatorId(): Promise<string> {
  const first = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (first) return first.id;

  const email = process.env.HONORDESK_SYSTEM_USER_EMAIL?.trim() || FALLBACK_SYSTEM_EMAIL;

  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (byEmail) return byEmail.id;

  try {
    const created = await prisma.user.create({
      data: {
        email,
        name: "HonorDesk (automático)",
        role: UserRole.OPS,
      },
      select: { id: true },
    });
    return created.id;
  } catch {
    const retry = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (retry) return retry.id;
    throw new Error("No se pudo crear ni obtener un usuario para las tareas.");
  }
}
