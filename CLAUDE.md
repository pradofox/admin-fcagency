# admin-fcagency

Plataforma admin unificada del Universo FC Agency. Reemplaza las 5 plataformas separadas (`produ`, `brand-content`, `community`, `model-operation`, `coco`) con un solo sistema de datos relacional y secciones por entidad.

## Estado actual (Fase 1 — scaffolding)

- Astro + CF Workers + D1 + auth custom con magic link
- Layout con sidebar + 7 secciones ruteables (Dashboard, Modelos, Producciones, Briefs, Contenido, Contactos, Clientes)
- **Modelos** funcional end-to-end: lista, alta, edit, eliminar, filtros por estado
- Producciones, Briefs, Contenido, Contactos, Clientes son placeholders con EmptyState
- Migración de datos desde Firebase actual — pendiente Fase 2
- Deploy a `admin.fcagency.mx` — pendiente que Fely cree DNS y CF account
- Las 5 plataformas viejas siguen vivas; no se tocan hasta Fase 3

## Stack (no cambiar)

- Astro 4 + TypeScript
- `@astrojs/cloudflare` adapter, output server
- Cloudflare D1 (SQLite serverless)
- Auth custom (magic link, sesión en cookie HttpOnly, código propio en `src/lib/auth.ts`)
- CSS vanilla, sin Tailwind, sin frameworks UI
- Solo `nanoid` como dependencia extra (para IDs)

## Convenciones

- **Idioma:** español México en TODA la UI y mensajes.
- **Estética:** dark mode #0E0E0E, dorados #C9A84C / #B8860B, Bebas Neue + DM Sans. Nunca fondo blanco.
- **Fechas:** ISO `YYYY-MM-DD` siempre.
- **IDs:** nanoid 16 chars para entidades, 32 para tokens.
- **Sin frameworks de UI.** Astro components y CSS vanilla.
- **XSS:** confía en el escape default de Astro `{}`. Nunca `set:html` con datos de usuario.
- **No proponer migrar de stack.** El stack fue elegido para que el dueño (Fely) pueda mantener con Claude Code.

## Workflow

1. Cambio local → `npm run dev` (http://localhost:4321)
2. Test → commit → push → CF deploya automático si está conectado a GitHub
3. Cambios de schema → nueva migration en `migrations/`, NUNCA editar las viejas

## Roles (3 niveles)

- `admin`: todo
- `editor`: lectura y escritura en su scope (marca/s asignada/s)
- `viewer`: solo lectura

## Estructura crítica

- `src/middleware.ts` — valida sesión en cada request, redirige a `/login` si falta
- `src/lib/auth.ts` — tokens, sesiones, cookies
- `src/lib/db.ts` — helper para acceder a D1 desde locals
- `src/lib/email.ts` — magic link (stub en dev, Resend en prod)
- `src/lib/session.ts` — `getUser(Astro)` y `requireUser(Astro)`
- `src/pages/api/` — endpoints REST
- `migrations/` — schema versionado, NUNCA editar archivos existentes; crear nuevos
- `schema.sql` — schema completo concatenado (para reset y referencia)

## Cómo agregar una sección nueva

1. Diseñar el schema. Crear `migrations/00XX_nombre.sql` con `CREATE TABLE`.
2. Correr `npm run db:migrate:local` (y `db:migrate:prod` cuando esté listo).
3. Crear `src/pages/nombre/index.astro` (lista), `nuevo.astro` (alta), `[id].astro` (detalle/edit).
4. Si necesitas API: `src/pages/api/nombre/index.ts` y `[id].ts`.
5. Agregar el link al `src/components/Sidebar.astro`.
6. Actualizar la bitácora abajo.

## Equipo real (validado leyendo código de las 4 plataformas viejas)

- **Vic** → opera `fc-agency-produ` (producciones). Path Firebase `producciones/`.
- **Andrea M** → opera `fc-agency-brand-content` (briefs, contenido, KPIs). Path Firebase `andrea/`.
- **Victoria** → opera `fc-agency-community` (CRM/tracker). Path Firebase `tracker/`. **OJO:** Vic y Victoria son personas distintas.
- **Renata Ondarza** → opera `fc-agency-model-operation` (roster de modelos, castings). Path Firebase `models/`.
- **Fely** → dueña, supervisión cross-marca.

## Documentación adicional

- `DESCUBRIMIENTOS.md` — análisis profundo de las 4 plataformas viejas, duplicaciones encontradas, decisiones pendientes para Fely.

## Bitácora

- **2026-05-14** — Scaffolding inicial: stack Astro+CF+D1+auth, layout, sidebar, Modelos funcional, placeholders.
- **2026-05-27** — Análisis de las 4 plataformas viejas. Schema extendido con 10 migraciones nuevas (0007-0016): proveedores+lineas_produccion, trabajos_modelo, campañas, KPIs, castings, contacto_pasos, acciones_calendario, extensiones a modelos/briefs/contactos. Secciones construidas: Producciones, Briefs+Contenido, Contactos+CRM, Castings. Script de migración Firebase→D1.
