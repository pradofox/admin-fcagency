# Handoff — admin-fcagency

> **Quick link para Claude Code en cualquier Mac:**
> https://raw.githubusercontent.com/pradofox/admin-fcagency/main/HANDOFF.md
>
> Pega ese link a tu Claude Code y dile "lee esto antes de hacer nada". Tendrá el contexto completo del proyecto.

Este doc te lleva de cero a productivo en una Mac nueva. Si solo vienes a entender qué es esto, lee la sección **1 — Qué es esto** y para.

---

## 1 — Qué es esto

Plataforma admin unificada del Universo FC Agency en producción que reemplaza las 5 plataformas separadas previas (`produ`, `brand-content`, `community`, `model-operation`, `coco`). Construida con Astro + Cloudflare Workers + D1 + auth custom con magic link.

- **Producción:** https://admin.fcagency.mx
- **Repo:** https://github.com/pradofox/admin-fcagency
- **Cuenta CF:** `Contacto@fcagency.mx's Account` (id `e4c8b06fcae74500b3b9c17a350953f4`)
- **D1:** `fc-admin` (id `f77ab0bc-02ef-42ed-b628-62eb21d8f0a4`)
- **Email:** Resend con dominio `fcagency.mx` verificado

Datos en producción al 2026-05-28:
- 147 modelos · 30 producciones (87 líneas) · 73 contactos · 18 trabajos modelos · 2 briefs · 2 piezas · 1 casting · 10 acciones calendario

---

## 2 — Quién usa qué

| Persona | Rol | Plataforma vieja que operaba |
|---|---|---|
| Fely | Dueña, admin general | todas (supervisión) |
| Roberto Prado | Soporte técnico, admin | n/a |
| Vic | Producciones, pagos | `fc-agency-produ` |
| Andrea M | Brand content, briefs, KPIs | `fc-agency-brand-content` |
| Victoria | CRM tracker | `fc-agency-community` |
| Renata Ondarza | Roster modelos, castings | `fc-agency-model-operation` |

Las 4 plataformas viejas siguen vivas en Firebase RTDB mientras el equipo se adapta. NO se tocan.

---

## 3 — Setup desde cero en otra Mac (20 min)

### 3.1 — Software base
```bash
# Si no tienes Homebrew:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Esenciales
brew install node git gh
brew install --cask visual-studio-code

# Claude Code
npm install -g @anthropic-ai/claude-code
```

### 3.2 — Logins
```bash
gh auth login          # GitHub.com → HTTPS → browser → autoriza
claude                  # browser login Anthropic, después /exit
```

### 3.3 — Clonar y configurar
```bash
mkdir -p ~/Code && cd ~/Code
gh repo clone pradofox/admin-fcagency
cd admin-fcagency
npm install

# Login Cloudflare (abre browser)
npx wrangler login
# Comprueba que ves AMBAS cuentas:
npx wrangler whoami
# Debe listar: Pradofox@sopadeletras.art + Contacto@fcagency.mx
```

### 3.4 — Verificar conexión a D1
```bash
npx wrangler d1 execute fc-admin --remote --command="SELECT COUNT(*) FROM modelos"
# Debe responder 147 (o el conteo real)
```

### 3.5 — Setup local opcional (para dev sin tocar producción)
```bash
npm run db:migrate:local        # corre las 17 migraciones en D1 local
npm run seed:admin -- tu@email.com "Tu Nombre"
npm run dev                     # http://localhost:4321
# En dev, el magic link se imprime en consola (no manda email)
```

Listo. Si los pasos pasan, estás trabajando.

---

## 4 — Workflow de cambios

```bash
git pull --rebase                       # 1. Lo último
claude                                   # 2. Edita con Claude Code (lee CLAUDE.md primero)
npm run dev                              # 3. Prueba local
npm run build                            # 4. Verifica que compile
npm run deploy                           # 5. Deploy a producción
git add -A && git commit -m "feat: ..." # 6. Versiona
git push                                 # 7. Sube a GitHub
```

Para cambios de schema:
```bash
# crea migrations/00XX_descripcion.sql con CREATE/ALTER
npm run db:migrate:local
npm run db:migrate:prod
npm run deploy
```

⚠️ NUNCA editar migraciones viejas. SQLite no acepta ALTER de CHECK constraints. Solo crea nuevas.

---

## 5 — Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local |
| `npm run build` | Build de producción a `./dist` |
| `npm run deploy` | Build + deploy a CF |
| `npm run db:migrate:local` | Aplica migraciones a D1 local |
| `npm run db:migrate:prod` | Aplica migraciones a D1 producción |
| `npm run seed:admin -- email "Nombre"` | Crea/actualiza admin |
| `npm run users` | Lista usuarios remotos |
| `npm run magic -- email [horas]` | Genera magic link manual y lo inserta en D1 |
| `npm run logs` | Tail en vivo de producción |
| `npm run rollback` | Rollback a versión anterior |
| `npm run migrate:firebase` | Re-genera SQL desde Firebase (no aplicar sin revisar) |

---

## 6 — Convenciones (no negociables)

- **Idioma:** español México en toda la UI y mensajes.
- **Estética:** paleta monocromática `#080808` → grises → `#FFFFFF`. Acento = blanco puro, NO color. Inter para todo + JetBrains Mono para datos tabulares.
- **Fechas:** ISO `YYYY-MM-DD` siempre.
- **IDs:** nanoid 16 chars para entidades, 32 para tokens.
- **XSS:** confía en el escape default de Astro `{}`. Nunca `set:html` con datos de usuario.
- **Stack:** NO migrar de stack. NO meter React/Vue/Tailwind.
- **Roles:** `admin` (todo), `editor` (escribe), `viewer` (solo lee). Hide buttons via `canEdit(user)`.
- **Sin escribir documentación nueva** sin pedirlo. Edita las existentes.

---

## 7 — Estructura del repo

```
admin-fcagency/
├── HANDOFF.md          ← este archivo
├── CLAUDE.md           ← contexto rápido para Claude Code
├── README.md           ← presentación general
├── PRODUCCION.md       ← estado vivo: URL, IDs, datos
├── PLAN.md             ← roadmap por fases
├── ARQUITECTURA.md     ← decisiones técnicas + diagrama
├── DESCUBRIMIENTOS.md  ← análisis de las 4 plataformas viejas
├── PREGUNTAS-FELY.md   ← decisiones pendientes con la dueña
├── migrations/         ← schema versionado (NUNCA editar viejos, solo agregar)
├── public/             ← favicon, apple-touch-icon, .assetsignore
├── scripts/
│   ├── seed-admin.mjs
│   ├── magic-link.mjs
│   └── migrate-from-firebase.mjs
├── src/
│   ├── env.d.ts        ← tipos D1, Runtime, SessionUser
│   ├── middleware.ts   ← valida sesión cada request
│   ├── lib/
│   │   ├── auth.ts     ← tokens, sesiones, cookies
│   │   ├── db.ts       ← helper getDB()
│   │   ├── email.ts    ← magic link via Resend
│   │   ├── session.ts  ← getUser, requireUser, requireAdmin, canEdit
│   │   ├── ids.ts      ← nanoid helpers
│   │   └── crm-pasos.ts ← catálogo de pasos por tipo de contacto
│   ├── components/     ← Layout, Sidebar, Header, EmptyState, NotasTimeline, *Card, *Form
│   ├── pages/          ← rutas (.astro + .ts api)
│   └── styles/global.css
├── wrangler.toml       ← bindings D1, vars, routes custom domain
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

---

## 8 — Troubleshooting frecuente

### Magic link no llega por Resend
- Revisa spam.
- Verifica que `RESEND_API_KEY` esté como secret: `npx wrangler secret list`
- Fallback: `npm run magic -- email@x 1` genera un link manual válido 1 hora.

### Build falla con error TS
```bash
npx wrangler types  # regenera tipos D1
npm run build
```

### Deploy con `BEGIN TRANSACTION` error
D1 no acepta transacciones SQL directas. Quita esas líneas del SQL antes de `wrangler d1 execute`.

### Migración con CHECK constraint falla
Los datos del SQL no encajan con los CHECK del schema. Normaliza antes de aplicar.

### Cambios no se ven después de deploy
Cache CF. `Cmd+Shift+R` en browser. Si persiste, espera 1-2 min.

### Custom domain "no route"
- Verifica `wrangler.toml` tiene la sección `routes` con `custom_domain = true`.
- En CF dashboard > Workers > admin-fcagency > Domains, verifica que `admin.fcagency.mx` esté Active.

### Pierdo acceso a CF de FC Agency
- Si Fely te quita de Members: `npx wrangler logout && npx wrangler login` con tu cuenta personal. Sigues con acceso a tu cuenta.
- Si Fely no te ha agregado de vuelta: el deploy y migraciones fallan, pero el sitio sigue vivo (lo opera CF). Pide reinvitación.

### El sitio responde pero D1 da error "binding DB not available"
Local sin database_id en wrangler.toml o D1 no creada. Para producción: la D1 ya existe con id `f77ab0bc-02ef-42ed-b628-62eb21d8f0a4`.

---

## 9 — Cómo Claude Code en la Mac de Fely usa esto

Ella ya tiene Claude Code instalado (ver `handoff-fely-claude-code.md` en `claude-code-general`). Para que su Claude entienda el proyecto:

1. **Una vez:** ella le pasa esta URL en cualquier sesión:
   ```
   https://raw.githubusercontent.com/pradofox/admin-fcagency/main/HANDOFF.md
   ```
   Y le dice "lee este handoff y ten contexto del proyecto".

2. **Cuando empiece a editar:** ella corre `gh repo clone pradofox/admin-fcagency`, luego `npm install`, luego `claude` en esa carpeta. El `CLAUDE.md` se carga automático.

3. **Si necesita auth con Wrangler:** ella corre `npx wrangler login` con su cuenta de FC, ya es Member directo de la org de CF.

---

## 10 — URLs y accesos importantes

| Cosa | URL |
|---|---|
| Producción | https://admin.fcagency.mx |
| Fallback workers.dev | https://admin-fcagency.contacto-4c8.workers.dev |
| Repo | https://github.com/pradofox/admin-fcagency |
| Raw HANDOFF (este doc) | https://raw.githubusercontent.com/pradofox/admin-fcagency/main/HANDOFF.md |
| Raw CLAUDE.md | https://raw.githubusercontent.com/pradofox/admin-fcagency/main/CLAUDE.md |
| CF dashboard cuenta FC | https://dash.cloudflare.com/e4c8b06fcae74500b3b9c17a350953f4 |
| Resend dashboard | https://resend.com/emails |
| Squarespace registrar | https://account.squarespace.com |
| Firebase legacy | https://console.firebase.google.com |

---

## 11 — Cuando esto termine y Fely opere todo

1. Fely va a CF > Manage Account > Members → quita a `pradofox@sopadeletras.art`
2. Transfer repo: `gh repo transfer pradofox/admin-fcagency FC-Agency`
3. Las 4 plataformas viejas Netlify ya pueden apagarse (redirect 301 a admin.fcagency.mx primero)
4. Firebase RTDB se queda como backup leído 30 días, después se apaga

---

## 12 — QA pasado al 2026-05-28

Ruta `/` `/login` `/dashboard` `/modelos` `/producciones` `/castings` `/briefs` `/contenido` `/contactos` `/clientes` `/pagos` `/calendario` `/admin` `/admin/duplicados` `/perfil` + detail pages + forms `/nuevo` + búsquedas + exports CSV + notas timeline POST/DELETE + API search + SSL custom domain → **18+ rutas verificadas, todas 200 OK**.

Si encuentras un 500 o 404 inesperado, revisa los logs:
```bash
npm run logs
```
