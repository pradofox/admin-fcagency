# Plan de construcción admin-fcagency

## Fase 0 — Diseño de datos y roles ✅ HECHA (hipótesis)

Schema inicial con 11 tablas: `users`, `sessions`, `auth_tokens`, `marcas`, `modelos`, `clientes`, `producciones`, `bookings`, `briefs`, `piezas_contenido`, `contactos`.

3 roles: `admin`, `editor`, `viewer`. Cada user tiene un campo `marcas` (JSON array) que limita a qué marcas tiene acceso.

⚠️ **Las definiciones de Fase 0 son hipótesis basadas en lo que sabemos de las 5 plataformas viejas.** Hay que validarlas con Fely respondiendo `PREGUNTAS-FELY.md`. Si alguna respuesta rompe el modelo, ajustamos schema con una nueva migration (nunca editar las viejas).

## Fase 1 — Scaffolding ✅ HECHA

- Astro + CF + D1 + auth custom
- Layout, sidebar, 7 secciones (1 funcional, 5 placeholder + dashboard)
- Modelos end-to-end (lista + alta + edit + eliminar + filtros)
- Documentación completa

## Fase 2 — Migrar secciones una por una

Una sección por iteración, en orden sugerido:

1. **Producciones** — la usa Vic. Conecta con Modelos vía bookings. Migrar datos de Firebase `/producciones/`.
2. **Briefs + Piezas de contenido** — la usa Andrea. Migrar `/andrea/briefs/` y `/andrea/contenido/`. Conectar con marcas.
3. **Contactos / CRM** — flujos por tipo (cliente, modelo, proveedor, aspirante). Cross-marca. Migrar contactos de las 4 plataformas viejas, deduplicar.
4. **Community** — la usa Renata. Definir mejor el modelo antes de migrar (qué hace exactamente community management hoy).
5. **Clientes** — extraer de los datos actuales, deduplicar contra contactos tipo `cliente`.

Cada sección incluye:
- Schema (si extiende el actual)
- UI: lista, nuevo, detalle
- API endpoints si aplica
- Script de migración de datos desde Firebase actual
- Test con la persona que la usa
- Sunset (redirect 301) de la plataforma vieja correspondiente

**Estimado realista por sección con dos Claudes Code en paralelo:** 2-3 días de trabajo activo.

## Fase 3 — Sunset platforms viejas

- Los 5 sitios Netlify viejos hacen redirect 301 a `admin.fcagency.mx/<seccion>`
- Firebase queda como backup leído pero no escrito
- Después de 30 días sin reportes, apagar Firebase RTDB
- Borrar repos viejos o archivarlos en GitHub

## Pendientes inmediatos para arrancar

Antes de poder correr la plataforma:

1. **Transferir repo** de `pradofox/admin-fcagency` a `FC-Agency/admin-fcagency` (Roberto, 1 click en GitHub).
2. **Crear D1 en Cloudflare:**
   ```bash
   npx wrangler d1 create fc-admin
   ```
   Copiar el `database_id` que imprime y pegarlo en `wrangler.toml`.
3. **Correr migraciones locales:**
   ```bash
   npm install
   npm run db:migrate:local
   ```
4. **Crear admin para login:**
   ```bash
   npm run seed:admin -- felicia@fcagency.mx "Felicia"
   npm run seed:admin -- roberto@sopadeletras.art "Roberto Prado"
   ```
5. **Probar:**
   ```bash
   npm run dev
   ```
   Ir a http://localhost:4321 → /login → poner email → ver el magic link en consola → click.

## Decisiones pendientes (necesitan respuesta de Fely)

Ver `PREGUNTAS-FELY.md`.

## Riesgos conocidos

- **Migración de datos viejos:** el schema relacional puede no encajar 1:1 con los árboles Firebase. Habrá que escribir scripts de transformación.
- **Datos sensibles de modelos:** bajo LFPDPPP, hay que documentar consentimiento y purpose limitation. La plataforma cerrada con auth ya mitiga gran parte del riesgo.
- **Performance:** D1 es lento en cold start (~100ms). Si llega a doler, hay que considerar cache con KV o Workers cache.
- **Realtime:** D1 no tiene listeners como Firebase RTDB. Si una pantalla necesita updates en vivo (ej. calendario compartido editado por dos personas a la vez), hay que pollear o agregar Durable Objects. La mayoría de pantallas NO necesitan realtime.
