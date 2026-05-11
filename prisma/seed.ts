import {
  ClientStatus,
  PrismaClient,
  Priority,
  ServiceType,
  TaskStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.clientService.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const opsUser = await prisma.user.create({
    data: {
      email: "ops@bithonor.com",
      name: "Operaciones",
      role: UserRole.OPS,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@bithonor.com",
      name: "Admin",
      role: UserRole.ADMIN,
    },
  });

  const clientSeeds = [
    { name: "Andes Pay", country: "CL", status: ClientStatus.ACTIVE, services: [ServiceType.SPA, ServiceType.PAY_IN_OUT] },
    { name: "Pacifica Corp", country: "MX", status: ClientStatus.ACTIVE, services: [ServiceType.EMPRESAS] },
    { name: "Lumen Retail", country: "CO", status: ClientStatus.ONBOARDING, services: [ServiceType.SPA] },
    { name: "Nova Logistics", country: "PE", status: ClientStatus.ACTIVE, services: [ServiceType.PAY_IN_OUT, ServiceType.NOMINA] },
    { name: "Cumbre HR", country: "CL", status: ClientStatus.ACTIVE, services: [ServiceType.NOMINA] },
    { name: "Atlas Fintech", country: "AR", status: ClientStatus.ACTIVE, services: [ServiceType.SPA, ServiceType.EMPRESAS] },
    { name: "Río Payroll", country: "UY", status: ClientStatus.INACTIVE, services: [ServiceType.NOMINA] },
    { name: "Solución SPA", country: "CL", status: ClientStatus.ACTIVE, services: [ServiceType.SPA] },
    { name: "Empresas del Sur", country: "CL", status: ClientStatus.ACTIVE, services: [ServiceType.EMPRESAS, ServiceType.PAY_IN_OUT] },
    { name: "Global Remit", country: "US", status: ClientStatus.ACTIVE, services: [ServiceType.PAY_IN_OUT] },
  ] as const;

  const clients = [];
  for (const c of clientSeeds) {
    const client = await prisma.client.create({
      data: {
        name: c.name,
        country: c.country,
        status: c.status,
        services: {
          create: c.services.map((service) => ({
            service,
            contractRef: `${service}-${c.name.slice(0, 3).toUpperCase()}-001`,
          })),
        },
      },
    });
    clients.push(client);
  }

  const taskTemplates: Array<{
    title: string;
    clientIndex: number;
    service: ServiceType;
    priority: Priority;
    status: TaskStatus;
    order: number;
    createdBy: string;
  }> = [
    { title: "Revisar liquidación semanal", clientIndex: 0, service: ServiceType.SPA, priority: Priority.URGENT, status: TaskStatus.PENDING, order: 0, createdBy: opsUser.id },
    { title: "Actualizar datos de contacto", clientIndex: 0, service: ServiceType.PAY_IN_OUT, priority: Priority.NORMAL, status: TaskStatus.IN_PROGRESS, order: 1, createdBy: opsUser.id },
    { title: "Onboarding checklist", clientIndex: 2, service: ServiceType.SPA, priority: Priority.HIGH, status: TaskStatus.PENDING, order: 0, createdBy: adminUser.id },
    { title: "Conciliación Pay In", clientIndex: 3, service: ServiceType.PAY_IN_OUT, priority: Priority.URGENT, status: TaskStatus.PENDING, order: 0, createdBy: opsUser.id },
    { title: "Nómina marzo", clientIndex: 3, service: ServiceType.NOMINA, priority: Priority.HIGH, status: TaskStatus.DONE, order: 1, createdBy: opsUser.id },
    { title: "Reporte mensual Empresas", clientIndex: 1, service: ServiceType.EMPRESAS, priority: Priority.LOW, status: TaskStatus.DONE, order: 0, createdBy: opsUser.id },
    { title: "Incidencia transferencia", clientIndex: 4, service: ServiceType.NOMINA, priority: Priority.URGENT, status: TaskStatus.IN_PROGRESS, order: 0, createdBy: opsUser.id },
    { title: "Alta de beneficiarios", clientIndex: 5, service: ServiceType.SPA, priority: Priority.NORMAL, status: TaskStatus.PENDING, order: 0, createdBy: adminUser.id },
    { title: "Contrato Empresas", clientIndex: 5, service: ServiceType.EMPRESAS, priority: Priority.NORMAL, status: TaskStatus.PENDING, order: 1, createdBy: adminUser.id },
    { title: "Cierre cuenta inactiva", clientIndex: 6, service: ServiceType.NOMINA, priority: Priority.LOW, status: TaskStatus.DONE, order: 0, createdBy: opsUser.id },
    { title: "Validación KYC interna", clientIndex: 7, service: ServiceType.SPA, priority: Priority.HIGH, status: TaskStatus.PENDING, order: 0, createdBy: opsUser.id },
    { title: "Soporte Pay Out", clientIndex: 8, service: ServiceType.PAY_IN_OUT, priority: Priority.NORMAL, status: TaskStatus.IN_PROGRESS, order: 0, createdBy: opsUser.id },
    { title: "Renovación contrato", clientIndex: 8, service: ServiceType.EMPRESAS, priority: Priority.LOW, status: TaskStatus.PENDING, order: 1, createdBy: opsUser.id },
    { title: "Corredor US corridor", clientIndex: 9, service: ServiceType.PAY_IN_OUT, priority: Priority.HIGH, status: TaskStatus.PENDING, order: 0, createdBy: adminUser.id },
    { title: "Backfill histórico", clientIndex: 1, service: ServiceType.EMPRESAS, priority: Priority.LOW, status: TaskStatus.PENDING, order: 1, createdBy: opsUser.id },
    { title: "QA release SPA", clientIndex: 7, service: ServiceType.SPA, priority: Priority.NORMAL, status: TaskStatus.DONE, order: 1, createdBy: adminUser.id },
    { title: "Migración datos", clientIndex: 2, service: ServiceType.SPA, priority: Priority.NORMAL, status: TaskStatus.IN_PROGRESS, order: 1, createdBy: opsUser.id },
    { title: "Seguimiento ticket #4412", clientIndex: 4, service: ServiceType.NOMINA, priority: Priority.NORMAL, status: TaskStatus.PENDING, order: 2, createdBy: opsUser.id },
    { title: "Capacitación equipo cliente", clientIndex: 9, service: ServiceType.PAY_IN_OUT, priority: Priority.LOW, status: TaskStatus.DONE, order: 1, createdBy: opsUser.id },
    { title: "Health check integración", clientIndex: 0, service: ServiceType.SPA, priority: Priority.NORMAL, status: TaskStatus.PENDING, order: 2, createdBy: adminUser.id },
  ];

  for (const t of taskTemplates) {
    const client = clients[t.clientIndex];
    if (!client) continue;
    await prisma.task.create({
      data: {
        title: t.title,
        clientId: client.id,
        service: t.service,
        priority: t.priority,
        status: t.status,
        order: t.order,
        createdBy: t.createdBy,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
