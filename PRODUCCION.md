# Producción — Estado vivo

## URL principal
**https://admin.fcagency.mx** (custom domain en Cloudflare)

## URL alternativa
**https://admin-fcagency.contacto-4c8.workers.dev** (workers.dev — fallback, sigue activo)

## DNS
- Zona `fcagency.mx` administrada en Cloudflare (cuenta FC Agency)
- Squarespace solo registrar
- Nameservers: `joyce.ns.cloudflare.com`, `melnicoff.ns.cloudflare.com`

## Cuenta Cloudflare
- **Account:** `Contacto@fcagency.mx's Account` (cuenta de FC Agency, separada de la de Roberto)
- **Account ID:** `e4c8b06fcae74500b3b9c17a350953f4`
- **D1 database:** `fc-admin` (id `f77ab0bc-02ef-42ed-b628-62eb21d8f0a4`)
- **Resend:** API key configurada como secret `RESEND_API_KEY`, dominio `fcagency.mx` verificado.

## Datos en producción (al 2026-05-28)

Migrados desde Firebase `fc-agency` a D1 `fc-admin`:

| Tabla | Filas | Fuente Firebase |
|---|---|---|
| modelos | 147 | `models/roster` |
| producciones | 30 | `producciones/` |
| lineas_produccion | 87 | `producciones/ev_N.provs[]` |
| contactos | 73 | `tracker/contactos` |
| trabajos_modelo | 18 | `models/roster.trabajos[]` |
| acciones_calendario | 10 | `tracker/calendario` |
| briefs | 2 | `andrea/briefs` |
| piezas_contenido | 2 | `andrea/contenido` |
| castings | 1 | `models/castings` |
| **TOTAL** | **370** | |

Los datos viejos siguen vivos en Firebase RTDB (las 4 plataformas viejas no se tocaron). Esta es una copia. Cuando el equipo migre a admin.fcagency.mx, las plataformas viejas se apagan.

## Usuarios admin

| Email | Nombre | Rol |
|---|---|---|
| roberto@sopadeletras.art | Roberto Prado | admin |
| contacto@fcagency.mx | Felicia (Fely) | admin |

Ambos recibieron magic link al activarse la plataforma. Los magic links expiran en 15 min y el flujo se puede repetir desde `/login`.

## Cómo entrar

1. Abre https://admin-fcagency.contacto-4c8.workers.dev
2. Pon tu email
3. Te llega el link de Resend (de `admin@fcagency.mx`)
4. Click → sesión iniciada por 30 días

Si Resend no llega: revisa spam, o pide a Roberto que genere un token manual con:
```bash
node scripts/seed-admin.mjs <email> "<Nombre>" --remote  # crea o reactiva user
# Después usa el /api/auth/login para que Resend mande el link
```

## Variables de entorno en producción

- `APP_URL` = `https://admin-fcagency.contacto-4c8.workers.dev` (en wrangler.toml)
- `RESEND_API_KEY` = configurado como secret (no commit)

## Deploy

```bash
npm run build
npm run deploy
```

Wrangler está logueado con cuenta `pradofox@sopadeletras.art` que tiene acceso (Super Administrator) a la cuenta de FC Agency vía invitación de Members.

## Bitácora

- **2026-05-28 13:00** — Repo + scaffolding inicial pusheado.
- **2026-05-28 15:00** — Análisis profundo de 4 plataformas viejas → DESCUBRIMIENTOS.md.
- **2026-05-28 15:30** — Schema extendido con 10 migraciones nuevas (0007-0016). Secciones funcionales construidas: Producciones (con líneas), Briefs (auto-pieza), Contenido, Contactos (CRM con pasos+semáforos), Castings, Dashboard.
- **2026-05-28 15:35** — Script de migración Firebase → D1 listo.
- **2026-05-28 15:40** — Cuenta CF separada creada para FC Agency. Roberto invitado como Super Admin.
- **2026-05-28 15:45** — D1 `fc-admin` creada. 16 migraciones aplicadas a local y remoto.
- **2026-05-28 15:55** — Deploy a `admin-fcagency.contacto-4c8.workers.dev`. workers.dev habilitado.
- **2026-05-28 15:50** — Resend API key configurada. APP_URL apuntando a producción.
- **2026-05-28 15:55** — Migración de 370 filas desde Firebase a D1 producción.
- **2026-05-28 16:00** — Seed admins: Roberto y Fely. Magic links disparados por Resend.
- **2026-05-28 20:30** — Construcción intensiva: roles + admin + Clientes + Pagos + Calendario + búsqueda en Modelos/Producciones/Contactos + detalle Castings con AJAX picker + Modelos con historial + dashboard real + notas timeline + export CSV + detección de duplicados + perfil + HANDOFF.md.
- **2026-05-28 21:00** — DNS de fcagency.mx migrado a Cloudflare (cuenta FC Agency). Custom domain `admin.fcagency.mx` configurado. APP_URL actualizado. Squarespace sigue como registrar.
