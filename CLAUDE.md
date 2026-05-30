# admin-fcagency

> **Si eres Claude Code abriendo este proyecto por primera vez:**
> 1. **Lee también `HANDOFF.md`** en la raíz del repo — tiene setup, comandos, troubleshooting, y URLs.
> 2. **Lee `DESCUBRIMIENTOS.md`** si vas a tocar el modelo de datos o entender por qué algo está como está.
> 3. Las convenciones de este archivo (idioma, estética, stack) son **no negociables**.

Plataforma admin unificada del Universo FC Agency **en producción** en https://admin.fcagency.mx. Reemplaza 5 plataformas separadas previas (`produ`, `brand-content`, `community`, `model-operation`, `coco`) con un solo sistema de datos relacional.

## Estado: EN PRODUCCIÓN

- Astro + CF Workers + D1 + auth custom con magic link via Resend
- 8 secciones funcionales: Dashboard, Modelos, Producciones, Castings, Briefs, Contenido, Contactos, Clientes + Pagos + Calendario + Admin
- 370 filas migradas desde Firebase (147 modelos, 30 producciones, 73 contactos, etc.)
- Auto-registro abierto temporal (cualquier email crea cuenta como viewer)
- Las 4 plataformas viejas Netlify/Firebase siguen vivas en paralelo; NO tocar

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
- **2026-05-28** — **EN PRODUCCIÓN.** URL: `https://admin.fcagency.mx` (custom domain). Cuenta CF separada para FC Agency. 370 filas migradas desde Firebase (147 modelos, 30 producciones, 73 contactos, etc.). Resend configurado. Admins Roberto y Fely activos. Las 4 plataformas viejas siguen vivas paralelo. Ver `PRODUCCION.md`.
- **2026-05-29** — Cotizador estilo hoja MATRIZ con catálogo de conceptos y backup de precios FC (commit `0fb12e1`). Branch `wip/horas-por-servicio` abierta con migración `0041_concepto_por_hora.sql` y cambios parciales en cotizaciones+proveedores para que el campo Horas solo aplique a conceptos cobrados por hora (modelo editorial, hora extra estudio, renta hora). Pendiente: completar lógica UI y mergear. Ver sección 1.5 del HANDOFF.
- **2026-05-29 (tarde)** — Mergeada wip/horas-por-servicio a main. Completado checkbox "Se cobra por hora" en form de edición de concepto. Migración `0042_fix_precio_mtz09.sql` corrige precio de Hra extra modelo editorial E. de $900 a $800 (typo en seed). Stats en perfil de modelo `/modelos/[id]`: tarjetas con % perfil completo, total trabajos (trabajos_modelo + lineas_produccion), última actualización (updated_at + material_actualizado_en). Deploy verificado.
