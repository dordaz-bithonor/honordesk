# HonorDesk — Documento de Contexto

**Sistema de gestión de clientes y tareas B2B · Bithonor**

| | |
|---|---|
| **Versión** | 1.1 |
| **Fecha** | Mayo 2026 |
| **Estado** | Borrador |
| **Autor** | Equipo Tecnología Bithonor |

> **Propósito:** Este documento provee todo el contexto necesario para construir HonorDesk en Cursor: visión del producto, arquitectura técnica, modelo de datos, flujos de usuario, stack tecnológico, criterios de aceptación y backlog inicial.

---

## Tabla de contenidos

1. [Visión general del producto](#1-visión-general-del-producto)
2. [Funcionalidades del sistema](#2-funcionalidades-del-sistema)
3. [Arquitectura técnica](#3-arquitectura-técnica)
4. [Modelo de datos](#4-modelo-de-datos)
5. [Flujos de usuario principales](#5-flujos-de-usuario-principales)
6. [Referencia de API](#6-referencia-de-api)
7. [Criterios de aceptación (MVP)](#7-criterios-de-aceptación-mvp)
8. [Backlog de desarrollo (MVP)](#8-backlog-de-desarrollo-mvp)
9. [Consideraciones operativas y de seguridad](#9-consideraciones-operativas-y-de-seguridad)
10. [Próximos pasos para comenzar en Cursor](#10-próximos-pasos-para-comenzar-en-cursor)

---

## 1. Visión general del producto

### 1.1 ¿Qué es HonorDesk?

HonorDesk es un sistema interno de gestión de clientes y tareas B2B de Bithonor. Centraliza en una única interfaz el universo de clientes activos, los servicios que cada uno contrata, y todas las tareas, solicitudes e incidencias asociadas a ellos.

Actualmente Bithonor opera con 10+ clientes B2B activos en múltiples líneas de servicio (SPA, Pay In/Out, Bithonor Empresas, Nómina Internacional), pero la gestión de solicitudes se hace de forma reactiva y dispersa, sin visibilidad centralizada ni priorización sistemática.

### 1.2 Problema que resuelve

| Dimensión | Situación actual (problema) | Situación objetivo (solución) |
|---|---|---|
| Visibilidad de clientes | No hay una vista única del universo B2B por servicio | Vista visual por servicio con estado de cada cliente |
| Backlog por cliente | Las solicitudes se trabajan reactivamente sin orden | Backlog priorizable por cliente con historial |
| Backlog centralizado | No existe visión consolidada de todos los trabajos | Backlog global filtrable por cliente, servicio, prioridad y estado |
| Priorización | Subjetiva e inconsistente entre los miembros del equipo | Drag & drop + priorización automática por criterio |
| Trazabilidad | Solicitudes perdidas en chats o correos | Cada tarea tiene cliente, servicio, estado y fecha asignados |

### 1.3 Usuarios objetivo

HonorDesk es una herramienta interna, no visible para los clientes. Los usuarios son:

| Rol | Uso principal |
|---|---|
| Daniel (Tech Lead / PM) | Gestión del backlog técnico, priorización, visión de carga de trabajo |
| Samuel (Head of Operations) | Visibilidad de estado de clientes, seguimiento de solicitudes operativas |
| Jonathan (CTO) | Revisión de tareas técnicas críticas, aporte a priorización |
| Anthony (Senior Dev) | Consulta de tareas asignadas por cliente |
| Jennifer (Customer Service) | Registro de solicitudes de clientes, seguimiento de resolución |
| Gabriela / Albert (Ops) | Registro y seguimiento de incidencias y tareas operativas |

### 1.4 Principios de diseño

- **Simplicidad visual primero** — la visibilidad debe lograrse en 1 clic, sin configuración
- **Rápido de usar** — agregar una tarea debe tomar menos de 30 segundos
- **Sin dependencias externas de pago** — la solución debe ser propia y autónoma
- **Diseño mobile-friendly** — el equipo opera también desde dispositivos móviles
- **Escalable** — debe poder crecer en número de clientes, servicios y usuarios sin re-arquitectura

---

## 2. Funcionalidades del sistema

### 2.1 Módulo: Universo de clientes

Vista principal del sistema. Muestra todos los clientes agrupados por servicio en una cuadrícula de tarjetas visuales.

| Feature | Descripción |
|---|---|
| Agrupación por servicio | Los clientes se listan bajo su servicio (SPA / Pay In/Out / Empresas / Nómina). Un cliente puede aparecer en múltiples grupos si contrata varios servicios. |
| Tarjeta de cliente | Muestra: nombre, país, avatar con iniciales, conteo de tareas urgentes / pendientes / hechas, y los servicios contratados como badges de color. |
| Métricas resumen | Fila superior con 4 KPIs: total clientes activos, tareas pendientes, urgentes, y servicios activos. |
| Acceso al detalle | Clic en cualquier tarjeta abre la vista de detalle de ese cliente con su backlog propio. |
| Estado visual rápido | Pills de color codifican el estado: rojo = urgente, azul = pendiente, verde = hecho. |

### 2.2 Módulo: Backlog centralizado

Lista unificada de todas las tareas de todos los clientes. Es el centro operativo del sistema.

| Feature | Descripción |
|---|---|
| Listado global | Todas las tareas en una sola vista, ordenadas por prioridad por defecto. |
| Filtro por servicio | Filtra las tareas por línea de negocio: SPA, Pay In/Out, Empresas, Nómina. |
| Filtro por cliente | Dropdown con todos los clientes para ver solo las tareas de ese cliente en la vista global. |
| Filtro por estado | Filtra por: Pendiente, En progreso, Hecho. |
| Filtro por prioridad | Filtra por: Urgente, Alta, Normal, Baja. |
| Búsqueda por texto | Campo de búsqueda que filtra por título de tarea o nombre de cliente. |
| Ordenamiento drag & drop | Arrastrar filas para reordenar manualmente la prioridad del backlog. |
| Priorización automática | Botón que reordena todas las tareas por nivel de prioridad (Urgente > Alta > Normal > Baja) en un clic. |
| Edición en modal | Clic en el ícono de editar abre modal con todos los campos modificables. |
| Eliminación | Botón de eliminar con confirmación implícita por color de ícono. |

### 2.3 Módulo: Detalle de cliente

Vista individual por cliente. Accesible desde la tarjeta en el Universo de clientes o desde la barra lateral.

| Feature | Descripción |
|---|---|
| Header del cliente | Avatar, nombre, país y badges de servicios contratados. |
| Stats individuales | 3 métricas: tareas pendientes, en progreso, y urgentes del cliente. |
| Backlog del cliente | Lista de tareas filtrada automáticamente a ese cliente, con las mismas capacidades del backlog global. |
| Priorizar cliente | Botón "Priorizar auto" que reordena solo las tareas de ese cliente por prioridad. |
| Drag & drop local | Reordenamiento manual dentro del backlog del cliente. |
| Navegación | Botón de regreso a la vista de universo de clientes. |

### 2.4 Módulo: Gestión de tareas (modal)

| Campo | Descripción |
|---|---|
| Título | Texto libre. Descripción breve de la tarea o solicitud. |
| Cliente | Dropdown con todos los clientes activos. Si se ingresa desde detalle de cliente, se pre-selecciona. |
| Servicio | Selector: SPA / Pay In/Out / Empresas / Nómina. |
| Prioridad | Selector: Urgente / Alta / Normal / Baja. Con indicadores visuales de color. |
| Estado | Selector: Pendiente / En progreso / Hecho. |
| Acciones | Guardar (crea o actualiza) o cancelar. Atajos de teclado futuros planeados. |

### 2.5 Funcionalidades futuras (backlog del producto)

- Asignación de tareas a personas del equipo
- Comentarios internos por tarea
- Fechas de vencimiento y notificaciones
- Vista Kanban alternativa al listado
- Adjuntar archivos a tareas
- Log de actividad por tarea (quién hizo qué y cuándo)
- Dashboard de métricas operativas (tiempo de resolución promedio por cliente)
- Integración con Slack para notificaciones de tareas urgentes
- API REST para integración futura con SIXMAP / SPA
- Gestión de clientes (agregar, editar, desactivar clientes desde la UI)

---

## 3. Arquitectura técnica

### 3.1 Stack tecnológico

> Stack seleccionado para maximizar velocidad de desarrollo y facilidad de deploy. Vercel + Supabase permite tener el sistema funcionando en minutos, con tier gratuito suficiente para validación con directiva.

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR nativo, routing simple, integración directa con Vercel sin configuración adicional |
| UI Components | Tailwind CSS + shadcn/ui | Consistente con el stack moderno del equipo, componentes accesibles listos para usar |
| Estado global | Zustand | Liviano, simple, ideal para estado de UI sin overhead de Redux |
| Backend | Next.js API Routes | Mismo proyecto Next.js, sin servidor separado, cero fricción de deploy |
| Base de datos | PostgreSQL via Supabase | Tier gratuito suficiente para MVP interno, UI visual para ver datos, backups automáticos incluidos |
| ORM | Prisma | Type-safe, migraciones automáticas, excelente DX con TypeScript y Supabase |
| **Auth (MVP)** | **PIN de 4 dígitos — variable de entorno** | **30 minutos de implementación, cero dependencias externas, ideal para validación rápida con directiva** |
| Auth (v2) | Magic Link via Supabase Auth | Migración natural desde Supabase, sin contraseñas, acceso individual por correo @bithonor.com |
| Deploy | Vercel | CI/CD automático desde GitHub, HTTPS nativo, deploy en minutos, tier gratuito para uso interno |
| Control de versiones | GitHub (repositorio privado) | Estándar actual del equipo |

### 3.2 Autenticación MVP: PIN de 4 dígitos

El mecanismo de acceso del MVP es intencionalmente simple. No requiere librerías de autenticación ni servicios externos.

**Cómo funciona:**

1. El PIN se define como variable de entorno `HONORDESK_PIN` en Vercel y en `.env.local` para desarrollo local.
2. Al acceder a cualquier ruta del dashboard, el middleware de Next.js verifica la presencia de una cookie `honordesk_session`.
3. Si no existe la cookie, redirige a `/pin`.
4. En `/pin` el usuario ingresa el PIN. La API Route `/api/auth/pin` compara el valor con `process.env.HONORDESK_PIN`.
5. Si coincide, se establece una cookie `httpOnly` con expiración de 8 horas y se redirige al dashboard.
6. El PIN nunca se almacena en la base de datos ni aparece en el código fuente.

**Código de referencia — middleware (`middleware.ts`):**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('honordesk_session')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/pin')

  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL('/pin', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

**Código de referencia — API Route (`app/api/auth/pin/route.ts`):**

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { pin } = await request.json()

  if (pin !== process.env.HONORDESK_PIN) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('honordesk_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })
  return response
}
```

### 3.3 Estructura de carpetas (Next.js)

```
honordesk/
├── app/
│   ├── (auth)/
│   │   ├── pin/page.tsx              ← Pantalla de acceso con PIN
│   │   └── actions.ts                ← Verificación del PIN + set cookie
│   ├── (dashboard)/
│   │   ├── page.tsx                  ← Universo de clientes
│   │   ├── backlog/page.tsx          ← Backlog centralizado
│   │   └── clients/[id]/page.tsx     ← Detalle de cliente
│   └── api/
│       ├── auth/pin/route.ts
│       ├── clients/route.ts
│       ├── tasks/route.ts
│       └── tasks/[id]/route.ts
├── components/
│   ├── ui/                           ← shadcn components
│   ├── ClientCard.tsx
│   ├── TaskRow.tsx
│   ├── TaskModal.tsx
│   ├── BacklogList.tsx
│   └── ServiceSection.tsx
├── lib/
│   ├── db.ts                         ← Prisma client
│   ├── store.ts                      ← Zustand store
│   └── utils.ts
├── middleware.ts                     ← Protección de rutas por PIN
├── prisma/
│   └── schema.prisma
└── types/index.ts
```

### 3.4 Flujo de datos

- El frontend (Next.js) renderiza las vistas y gestiona el estado local con Zustand.
- Las acciones del usuario (crear tarea, reordenar, filtrar) llaman a las API Routes.
- Las API Routes ejecutan queries Prisma sobre PostgreSQL (Supabase).
- El reordenamiento drag & drop actualiza el campo `order` (integer) de cada tarea en la BD.
- El middleware Next.js protege todas las rutas verificando la cookie `honordesk_session`.

---

## 4. Modelo de datos

### 4.1 Entidades principales

#### `Client` — Cliente B2B

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| name | String | Nombre comercial del cliente |
| country | String | País de operación |
| status | Enum | `ACTIVE` \| `INACTIVE` \| `ONBOARDING` |
| notes | Text? | Notas internas opcionales |
| createdAt | DateTime | Fecha de alta en el sistema |
| updatedAt | DateTime | Última modificación |

#### `ClientService` — Servicios por cliente

Tabla de relación muchos-a-muchos entre `Client` y servicio.

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| clientId | FK | → Client |
| service | Enum | `SPA` \| `PAY_IN_OUT` \| `EMPRESAS` \| `NOMINA` |
| startDate | Date | Fecha de inicio del servicio |
| contractRef | String? | Referencia interna del contrato |

#### `Task` — Tarea / Solicitud

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| title | String | Título de la tarea |
| description | Text? | Descripción detallada (opcional) |
| clientId | FK | → Client |
| service | Enum | `SPA` \| `PAY_IN_OUT` \| `EMPRESAS` \| `NOMINA` |
| priority | Enum | `URGENT` \| `HIGH` \| `NORMAL` \| `LOW` |
| status | Enum | `PENDING` \| `IN_PROGRESS` \| `DONE` |
| order | Integer | Posición en el backlog para drag & drop |
| assignedTo | FK? | → User (versión futura) |
| dueDate | DateTime? | Fecha límite (versión futura) |
| createdAt | DateTime | — |
| updatedAt | DateTime | — |
| createdBy | FK | → User |

#### `User` — Usuario interno

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | — |
| email | String | Identificador único |
| name | String | Nombre para display |
| role | Enum | `ADMIN` \| `OPS` \| `DEV` \| `SUPPORT` |
| createdAt | DateTime | — |

### 4.2 Schema Prisma

```prisma
model Client {
  id        String        @id @default(uuid())
  name      String
  country   String
  status    ClientStatus  @default(ACTIVE)
  notes     String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  services  ClientService[]
  tasks     Task[]
}

model ClientService {
  id          String      @id @default(uuid())
  clientId    String
  client      Client      @relation(fields: [clientId], references: [id])
  service     ServiceType
  startDate   DateTime    @default(now())
  contractRef String?
}

model Task {
  id          String      @id @default(uuid())
  title       String
  description String?
  clientId    String
  client      Client      @relation(fields: [clientId], references: [id])
  service     ServiceType
  priority    Priority    @default(NORMAL)
  status      TaskStatus  @default(PENDING)
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  createdBy   String
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      UserRole @default(OPS)
  createdAt DateTime @default(now())
}

enum ServiceType  { SPA PAY_IN_OUT EMPRESAS NOMINA }
enum Priority     { URGENT HIGH NORMAL LOW }
enum TaskStatus   { PENDING IN_PROGRESS DONE }
enum ClientStatus { ACTIVE INACTIVE ONBOARDING }
enum UserRole     { ADMIN OPS DEV SUPPORT }
```

---

## 5. Flujos de usuario principales

### 5.1 Ver universo de clientes

1. Usuario accede a HonorDesk → si no tiene cookie de sesión, es redirigido a `/pin`.
2. Ingresa el PIN → cookie establecida → redirigido a `/` (landing del dashboard).
3. La página carga los clientes agrupados por servicio (`GET /api/clients?include=services,taskCounts`).
4. Cada tarjeta muestra nombre, país, servicios contratados y conteo de tareas por estado.
5. El usuario puede filtrar visualmente haciendo clic en un badge de servicio.
6. Clic en una tarjeta → navega a `/clients/[id]`.

### 5.2 Gestionar backlog de un cliente

1. Usuario navega a `/clients/[id]` directamente o desde una tarjeta.
2. Se carga el header del cliente + sus stats + su backlog (`GET /api/tasks?clientId=[id]&orderBy=order`).
3. El usuario puede arrastrar filas para reordenar → `PATCH /api/tasks/reorder` con el nuevo array de IDs.
4. Clic en "Priorizar auto" → reordena localmente y persiste el nuevo orden.
5. Clic en editar tarea → abre modal pre-relleno → al guardar hace `PATCH /api/tasks/[id]`.
6. Clic en eliminar → `DELETE /api/tasks/[id]` → se remueve optimisticamente del estado local.

### 5.3 Crear nueva tarea

1. Usuario hace clic en "Nueva tarea" desde cualquier vista.
2. Se abre el modal de creación.
3. Si el usuario está en la vista de detalle de cliente, el campo cliente se pre-selecciona.
4. Completa: título (obligatorio), cliente (obligatorio), servicio, prioridad, estado.
5. Al guardar → `POST /api/tasks` → se agrega al inicio del backlog del cliente.
6. La vista se actualiza optimisticamente sin recargar la página.

### 5.4 Backlog centralizado con filtros

1. Usuario navega a "Backlog central" desde la barra lateral.
2. Carga todas las tareas (`GET /api/tasks?orderBy=priority,order`).
3. Aplica filtros combinados: servicio + cliente + estado + prioridad + texto.
4. Los filtros son acumulativos y se aplican en el cliente (sin llamadas adicionales al servidor).
5. Clic en "Priorizar auto" → reordena el array filtrado visible y persiste el nuevo orden global.

---

## 6. Referencia de API

### 6.1 Endpoints de clientes

| Método + Ruta | Descripción | Params / Body |
|---|---|---|
| `GET /api/clients` | Lista todos los clientes activos | `?include=services,taskCounts&status=ACTIVE` |
| `GET /api/clients/:id` | Detalle de un cliente | Incluye servicios y stats de tareas |
| `POST /api/clients` | Crea un nuevo cliente | `{ name, country, status, services[] }` |
| `PATCH /api/clients/:id` | Actualiza datos del cliente | `{ name?, country?, status?, notes? }` |

### 6.2 Endpoints de tareas

| Método + Ruta | Descripción | Params / Body |
|---|---|---|
| `GET /api/tasks` | Lista tareas con filtros opcionales | `?clientId=&service=&status=&priority=&orderBy=order` |
| `POST /api/tasks` | Crea una nueva tarea | `{ title, clientId, service, priority, status }` |
| `PATCH /api/tasks/:id` | Actualiza una tarea | `{ title?, priority?, status?, service?, clientId? }` |
| `DELETE /api/tasks/:id` | Elimina una tarea | — |
| `PATCH /api/tasks/reorder` | Actualiza el orden (drag & drop) | `{ ids: string[] }` — array de IDs en nuevo orden |

### 6.3 Endpoint de autenticación

| Método + Ruta | Descripción | Body |
|---|---|---|
| `POST /api/auth/pin` | Verifica el PIN y establece cookie de sesión | `{ pin: string }` |
| `POST /api/auth/logout` | Elimina la cookie de sesión | — |

---

## 7. Criterios de aceptación (MVP)

> El MVP está completo cuando todos los criterios marcados a continuación están verificados por el equipo en Vercel con datos reales.

### 7.1 Vista Universo de clientes

- [ ] Al cargar la página, los clientes se agrupan correctamente por servicio.
- [ ] Cada tarjeta muestra el conteo correcto de tareas urgentes, pendientes y hechas.
- [ ] El clic en una tarjeta navega al detalle del cliente correspondiente.
- [ ] Las métricas de la fila superior (total clientes, pendientes, urgentes) son correctas.

### 7.2 Vista Backlog centralizado

- [ ] El listado muestra todas las tareas activas, ordenadas por prioridad por defecto.
- [ ] Todos los filtros (servicio, cliente, estado, prioridad, texto) funcionan de forma independiente y combinada.
- [ ] El drag & drop reordena las tareas y persiste el nuevo orden tras recargar la página.
- [ ] El botón "Priorizar auto" reordena correctamente por Urgente > Alta > Normal > Baja.

### 7.3 Vista Detalle de cliente

- [ ] El header muestra la información correcta del cliente y sus servicios.
- [ ] El backlog del cliente solo muestra las tareas de ese cliente.
- [ ] El drag & drop y la priorización automática funcionan localmente para el cliente.

### 7.4 Gestión de tareas

- [ ] Una tarea se puede crear en menos de 30 segundos desde cualquier vista.
- [ ] Al crear desde la vista de cliente, el campo cliente se pre-selecciona correctamente.
- [ ] Editar y eliminar tareas funciona desde el backlog central y desde el detalle del cliente.
- [ ] Los cambios se reflejan en todas las vistas sin recargar la página.

### 7.5 Autenticación PIN

- [ ] La pantalla de PIN se muestra al acceder por primera vez o con sesión expirada.
- [ ] Un PIN incorrecto muestra mensaje de error claro.
- [ ] Un PIN correcto establece una cookie de sesión `httpOnly` con expiración de 8 horas.
- [ ] Todas las rutas del dashboard verifican la cookie via middleware Next.js y redirigen a `/pin` si no existe.
- [ ] El PIN vive únicamente en la variable de entorno `HONORDESK_PIN`. No aparece en base de datos ni en el código fuente.

---

## 8. Backlog de desarrollo (MVP)

### Sprint 1 — Fundación (semana 1–2)

| # | Tarea | Est. |
|---|---|---|
| S1-01 | Setup del proyecto Next.js + TypeScript + Tailwind + shadcn | 2h |
| S1-02 | Configuración de Prisma + PostgreSQL (Supabase) | 3h |
| S1-03 | Schema inicial y migraciones (Client, ClientService, Task) | 3h |
| S1-04 | Autenticación PIN: página `/pin` + middleware + cookie de sesión | 1.5h |
| S1-05 | Layout base: sidebar + topbar + content area | 4h |
| S1-06 | API: `GET /api/clients` con servicios y conteos de tareas | 3h |
| S1-07 | Vista Universo de clientes: grid por servicio + tarjetas | 6h |
| S1-08 | Seed de datos de prueba (10 clientes + 20 tareas) | 1h |

**Total estimado: ~23.5h**

### Sprint 2 — Backlog y tareas (semana 3–4)

| # | Tarea | Est. |
|---|---|---|
| S2-01 | API: `GET / POST / PATCH / DELETE /api/tasks` | 5h |
| S2-02 | API: `PATCH /api/tasks/reorder` (actualización de orden) | 3h |
| S2-03 | Vista Backlog centralizado: listado + filtros | 6h |
| S2-04 | Drag & drop en backlog (`@hello-pangea/dnd`) | 6h |
| S2-05 | Modal de creación y edición de tareas | 4h |
| S2-06 | Botón priorización automática (Backlog central) | 2h |
| S2-07 | Vista Detalle de cliente + backlog individual | 5h |
| S2-08 | Priorización automática en vista de cliente | 1h |

**Total estimado: ~32h**

### Sprint 3 — Pulido y deploy (semana 5)

| # | Tarea | Est. |
|---|---|---|
| S3-01 | Responsive design y pruebas móviles | 4h |
| S3-02 | Optimistic updates (UI no espera respuesta del servidor) | 3h |
| S3-03 | Estados de carga (skeletons) y manejo de errores | 3h |
| S3-04 | Deploy en Vercel + conexión a Supabase (variables de entorno) | 1h |
| S3-05 | Variables de entorno: `DATABASE_URL`, `HONORDESK_PIN`, `DIRECT_URL` | 1h |
| S3-06 | Migración de datos reales de clientes existentes | 2h |
| S3-07 | Testing con el equipo y corrección de bugs | 4h |
| S3-08 | Go-live y comunicación interna | 1h |

**Total estimado: ~19h**

---

## 9. Consideraciones operativas y de seguridad

### 9.1 Seguridad

- HonorDesk es una herramienta interna exclusivamente. Vercel garantiza HTTPS en todas las rutas.
- Todas las API Routes deben verificar la cookie de sesión antes de procesar cualquier request.
- Los datos de clientes B2B son información comercial sensible — el PIN no debe compartirse fuera del equipo interno.
- No almacenar credenciales, datos bancarios ni información de transacciones de clientes en HonorDesk (eso vive en SIXMAP / SPA).
- Backup automático de la base de datos PostgreSQL incluido en Supabase (tier gratuito: 7 días de retención).
- En v2, al migrar a Magic Link, cada persona tendrá acceso individual y se podrá auditar quién accedió.

### 9.2 Variables de entorno requeridas

| Variable | Descripción | Dónde se define |
|---|---|---|
| `DATABASE_URL` | Connection string Supabase (pooler) | Vercel + `.env.local` |
| `DIRECT_URL` | Connection string Supabase (directo, para migraciones) | `.env.local` únicamente |
| `HONORDESK_PIN` | PIN de 4 dígitos de acceso | Vercel + `.env.local` |
| `NODE_ENV` | `production` en Vercel, `development` en local | Automático |

### 9.3 Separación de entornos

- **Desarrollo:** local con `.env.local`, base de datos Supabase en proyecto de desarrollo.
- **Staging:** branch `staging` en GitHub → deploy automático en Vercel con preview URL.
- **Producción:** branch `main` → deploy manual en Vercel con dominio interno.

### 9.4 Alcance y límites del sistema

> HonorDesk es un sistema de gestión interna. No es un CRM completo, no reemplaza a SIXMAP ni a SPA, y no maneja datos financieros de transacciones.

| HonorDesk **SÍ** gestiona | HonorDesk **NO** gestiona |
|---|---|
| Clientes B2B activos y sus servicios contratados | Transacciones financieras de clientes |
| Tareas, solicitudes e incidencias por cliente | Wallets, balances o movimientos de dinero |
| Priorización del trabajo del equipo interno | KYC o verificación de identidad de clientes |
| Visibilidad del estado operativo B2B | Contratos o documentos legales de clientes |
| Notas internas sobre clientes | Reportes financieros o contables |

---

## 10. Próximos pasos para comenzar en Cursor

### 10.1 Checklist de inicio

1. Crear repositorio privado en GitHub: `honordesk`
2. Inicializar proyecto:
   ```bash
   npx create-next-app@latest honordesk --typescript --tailwind --app
   ```
3. Instalar dependencias:
   ```bash
   npm install prisma @prisma/client zustand @hello-pangea/dnd
   npx shadcn@latest init
   ```
4. Crear proyecto en [Supabase](https://supabase.com) y copiar `DATABASE_URL` y `DIRECT_URL` a `.env.local`
5. Definir el PIN de acceso y agregarlo como `HONORDESK_PIN=XXXX` en `.env.local` y en Vercel
6. Copiar el schema Prisma de la sección 4.2 y ejecutar:
   ```bash
   npx prisma migrate dev --name init
   ```
7. Cargar el seed de datos de prueba (10 clientes + 20 tareas)
8. Conectar repositorio a Vercel y configurar variables de entorno
9. Abrir en Cursor y comenzar con Sprint 1 (S1-01 al S1-08)

### 10.2 Prompt de contexto para Cursor AI

Pegar al inicio de cada sesión de desarrollo en Cursor:

```
Estás ayudando a construir HonorDesk, un sistema interno de gestión
de clientes y tareas B2B para Bithonor (fintech de pagos internacionales).

Stack: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
       + Prisma + PostgreSQL (Supabase) + Zustand

Entidades: Client, ClientService, Task, User
Servicios B2B: SPA | PAY_IN_OUT | EMPRESAS | NOMINA
Prioridades:   URGENT | HIGH | NORMAL | LOW
Estados:       PENDING | IN_PROGRESS | DONE

Vistas principales:
  1. /             → Universo de clientes (grid por servicio)
  2. /backlog      → Backlog centralizado (filtros + drag & drop)
  3. /clients/[id] → Detalle y backlog de un cliente

Autenticación: PIN de 4 dígitos almacenado en env var HONORDESK_PIN,
verificado en /api/auth/pin, sesión via cookie httpOnly (8h).
Middleware Next.js protege todas las rutas del dashboard.
Migración futura a Magic Link via Supabase Auth.

Deploy: Vercel + Supabase (ver variables de entorno en sección 9.2)

Principios: simplicidad, velocidad, sin librerías innecesarias.
El código debe ser limpio, con TypeScript estricto y componentes reutilizables.
```

---

*HonorDesk — Documento de Contexto v1.1 — Mayo 2026*
*Bithonor · CR Tecnología y Finanzas · Uso interno y confidencial*
