# HonorDesk

Sistema interno de gestión de clientes y tareas B2B (Bithonor). Stack: **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma**, **PostgreSQL** (Supabase), **Zustand**.

Documentación de producto y dominio: [docs/HonorDesk_Contexto_v1.1.md](docs/HonorDesk_Contexto_v1.1.md).

## Cuentas: Cursor (Inspirazone) vs GitHub / Supabase / Vercel (Bithonor)

Puedes usar **Cursor** con `info@inspirazone.com` y, a la vez, que **solo este proyecto** use **GitHub / Supabase / Vercel** con `dordaz@bithonor.com`. La cuenta de Cursor no controla el `git push`; lo controlan las credenciales que Git guarda para GitHub.

Este repo está configurado para **no mezclar** credenciales con tus otros repos:

- `credential.useHttpPath=true` **solo aquí** (Git guarda credenciales por URL completa, no solo por `github.com`).
- `origin` en **HTTPS** con usuario explícito: `https://dordaz-bithonor@github.com/dordaz-bithonor/honordesk.git`

Así otros proyectos en tu PC pueden seguir usando GitHub con **inspirazone** sin que este `remote` les afecte.

Si al hacer `git push` ves `denied to inspirazone`, Windows tenía guardada una credencial genérica de GitHub: abre **Administrador de credenciales de Windows** → **Credenciales de Windows** → busca entradas `git:https://github.com` y elimina la que corresponda a la cuenta equivocada; luego vuelve a hacer `git push` y pega el **PAT de dordaz-bithonor** cuando pida contraseña.

Pasos que debes hacer tú (navegador / GitHub):

1. Con sesión **dordaz@bithonor.com**, crea en GitHub el repositorio vacío **`honordesk`** bajo el usuario **`dordaz-bithonor`** (sin README ni `.gitignore` si ya tienes historial local).
2. Autenticación **Git → GitHub** como Bithonor: **SSH** (clave pública en *Settings → SSH keys* de esa cuenta GitHub) o **HTTPS + PAT** desde la misma cuenta.
3. En esta carpeta, el autor de commits ya está fijado **solo en este repo** a `dordaz@bithonor.com` (no cambia tu `git config --global`). Verifica con `git config user.email`.

Primer envío cuando el repo remoto exista y la clave/token estén listos:

```bash
git push -u origin main
```

Si prefieres **SSH** en lugar de HTTPS+PAT: añade una clave SSH en GitHub (cuenta **dordaz-bithonor**) y cambia el remote a `git@github.com:dordaz-bithonor/honordesk.git` (las claves SSH suelen ser por máquina; si una clave está solo en la cuenta Bithonor, no uses esa misma clave en la cuenta inspirazone salvo que sepas cómo gestionar `~/.ssh/config`).

### Supabase (cuenta Bithonor)

1. Inicia sesión en [supabase.com](https://supabase.com) con **dordaz@bithonor.com**.
2. Crea el proyecto y copia **DATABASE_URL** (pooler) y **DIRECT_URL** (directo) desde *Project Settings → Database*.
3. Pégalos en `.env.local` junto con `HONORDESK_PIN`.
4. Ejecuta `npm run db:migrate:deploy` y `npm run db:seed` (ver sección *Configuración* arriba).

### Vercel (cuenta Bithonor)

1. Inicia sesión en [vercel.com](https://vercel.com) con **dordaz@bithonor.com**.
2. *New Project* → importa **`dordaz-bithonor/honordesk`** y autoriza la integración con GitHub cuando lo pida.
3. Variables de entorno del proyecto: `DATABASE_URL`, `HONORDESK_PIN` (y `DIRECT_URL` si tu flujo de migraciones lo necesita en ese entorno).
4. Tras el deploy, prueba el PIN en la URL que te asigne Vercel.

### Comprobaciones rápidas

| Qué | Cómo comprobarlo |
| --- | --- |
| Remote | `git remote -v` muestra `dordaz-bithonor/honordesk`. |
| Autor del commit | `git log -1 --format='%ae %an'` muestra `dordaz@bithonor.com`. |
| Push | `git push` sin error 403 (identidad GitHub correcta). |

## Requisitos

- Node.js LTS
- Proyecto **PostgreSQL** (recomendado: [Supabase](https://supabase.com))

## Configuración

1. Copia variables de entorno:

   ```bash
   copy .env.example .env.local
   ```

   En macOS/Linux: `cp .env.example .env.local`

2. Rellena en `.env.local`:

   - `DATABASE_URL` — conexión pooled (p. ej. puerto `6543` en Supabase).
   - `DIRECT_URL` — conexión directa para migraciones (p. ej. puerto `5432`). Si no usas pooler, puedes usar el mismo valor que `DATABASE_URL`.
   - `HONORDESK_PIN` — PIN de acceso MVP (solo variable de entorno; no va en el repositorio).

3. Aplica migraciones y datos de prueba (los scripts cargan **`.env.local`** vía `dotenv-cli`; Prisma por sí solo no lee `.env.local`):

   ```bash
   npm run db:migrate:deploy
   npm run db:seed
   ```

   En desarrollo local también puedes usar `npm run db:migrate` (equivale a `prisma migrate dev` con las mismas variables).

4. Arranque:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000), introduce el PIN y revisa el universo de clientes en `/`.

## Scripts útiles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (Turbopack) |
| `npm run build` | `prisma generate` + build de producción |
| `npm run db:migrate` | Crear/aplicar migraciones en desarrollo |
| `npm run db:migrate:deploy` | Aplicar migraciones (CI/producción) |
| `npm run db:seed` | Cargar datos de ejemplo (usuarios, clientes, tareas) |
| `npm run lint` | ESLint |

## API interna (MVP)

- `POST /api/auth/pin` — valida `HONORDESK_PIN` y fija cookie de sesión `httpOnly`.
- `POST /api/auth/logout` — borra la cookie de sesión.
- `GET /api/clients` — lista clientes; query recomendada: `?include=services,taskCounts&status=ACTIVE` (requiere sesión).

Las rutas bajo `/api` **no** redirigen al PIN: devuelven `401` si falta sesión, para no romper `fetch` desde el cliente.

## Despliegue (Vercel)

Define en el proyecto de Vercel: `DATABASE_URL`, `HONORDESK_PIN`, y (si aplicas migraciones desde tu máquina o CI) mantén `DIRECT_URL` en secretos de desarrollo. El build ejecuta `prisma generate` automáticamente vía script `build`.

## Cómo pedir evoluciones (flexible)

El contexto en `docs/` es una guía viva. Para añadir o cambiar funcionalidad en sesiones sueltas con el asistente, conviene indicar:

1. **Qué debe ver el usuario** (resultado observable).
2. **Dónde** debería vivir (ruta, p. ej. `/`, `/clients/[id]`, nueva `/mapa`), o dejar que se proponga el cambio mínimo.
3. Si aplica: **reutilizar** un endpoint existente (p. ej. “usa los mismos datos que `GET /api/clients`”).

Mantén `page.tsx` como composición; la presentación reusable suele ir en `components/` para poder iterar (diagramas, perfiles, modales) sin reestructurar todo el proyecto.

## Prisma

Se fija **Prisma 6.x** en este repo para conservar `url` / `directUrl` en `schema.prisma` de forma estándar con Supabase.
