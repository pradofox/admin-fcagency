# admin-fcagency

Plataforma admin unificada del Universo FC Agency. Reemplaza las 5 plataformas separadas con un solo sistema.

**Stack:** Astro + Cloudflare Workers + D1 + auth custom con magic link  
**Estética:** dark mode #0E0E0E + dorados #C9A84C, Bebas Neue + DM Sans  
**Idioma:** español México

---

## Setup local (5 min)

```bash
# clonar
git clone https://github.com/pradofox/admin-fcagency.git
cd admin-fcagency

# instalar
npm install

# crear D1 local
npx wrangler d1 create fc-admin
# ↑ copia el database_id que imprime y pégalo en wrangler.toml en database_id = "..."

# correr migraciones
npm run db:migrate:local

# crear un admin para login
npm run seed:admin -- tu@email.com "Tu Nombre"

# arrancar
npm run dev
# abre http://localhost:4321
```

En desarrollo, el magic link se imprime en la **consola del servidor** (no se manda email). Cópialo del log y pégalo en el browser.

## Deploy a producción

```bash
# crear D1 remota
npx wrangler d1 create fc-admin --remote

# correr migraciones en remota
npm run db:migrate:prod

# seed admin en remota
npm run seed:admin -- felicia@fcagency.mx "Felicia" --remote

# (opcional) configurar Resend para mandar emails reales
npx wrangler secret put RESEND_API_KEY
# pega la key cuando te pida

# deploy
npm run deploy
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local en http://localhost:4321 |
| `npm run build` | Build de producción a `./dist` |
| `npm run preview` | Preview del build con wrangler dev |
| `npm run deploy` | Build + deploy a Cloudflare |
| `npm run db:migrate:local` | Corre todas las migraciones en D1 local |
| `npm run db:migrate:prod` | Corre todas las migraciones en D1 producción |
| `npm run seed:admin -- email "Nombre"` | Crea/actualiza un usuario admin |

## Documentación

- `CLAUDE.md` — contexto para Claude Code (léelo si vas a editar)
- `PLAN.md` — plan de construcción por fases y estado actual
- `ARQUITECTURA.md` — diagrama, decisiones técnicas, modelo de datos
- `PREGUNTAS-FELY.md` — preguntas abiertas pendientes para la dueña

## Convenciones

- Idioma: **español México** en toda la UI.
- Estética: **dark mode + dorados**. Nunca fondo blanco.
- Fechas: **ISO YYYY-MM-DD**.
- IDs: nanoid 16 chars.
- Schema: nueva migration por cambio, **nunca editar migraciones viejas**.

## Estado

Fase 1 (scaffolding) ✅ — Modelos funcional, resto placeholder. Ver `PLAN.md` para próximos pasos.
