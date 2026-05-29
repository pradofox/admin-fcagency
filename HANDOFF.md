# Handoff — Trabajar admin-fcagency desde otra computadora

Setup completo para que puedas clonar el proyecto en otra Mac (o cualquier máquina con tus credenciales) y seguir editando con todos los accesos.

---

## 0. Credenciales que necesitas tener acceso

Antes de empezar, ten a mano:
- **GitHub**: cuenta `pradofox` (mail asociado). Si tienes 2FA, necesitas autenticador o backup codes.
- **Cloudflare**: cuenta `pradofox@sopadeletras.art` (también con acceso a la cuenta de FC Agency `Contacto@fcagency.mx's Account` via invitación de Member).
- **Resend**: API key `RESEND_API_KEY` (ya está como secret en CF, no necesitas tocarla a menos que la roten).
- Opcional: acceso a Firebase consola `fc-agency` (Google login) por si hay que tocar plataformas viejas.

---

## 1. Software base (Mac)

```bash
# Si no tienes Homebrew:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Esenciales:
brew install node git gh
brew install --cask visual-studio-code

# Claude Code:
npm install -g @anthropic-ai/claude-code
```

Verifica:
```bash
node --version  # >= v20
gh --version
claude --version
```

---

## 2. Logins

```bash
# GitHub
gh auth login
# Selecciona: GitHub.com → HTTPS → Login with browser → autoriza
# Comprueba: gh api user | jq .login   # debe decir "pradofox"

# Claude Code
claude
# Te abre browser para login con tu cuenta Anthropic. Después /exit.

# Cloudflare Wrangler (login via npx desde el repo, ver siguiente paso)
```

---

## 3. Clonar y configurar admin-fcagency

```bash
mkdir -p ~/Code && cd ~/Code
gh repo clone pradofox/admin-fcagency
cd admin-fcagency

npm install
```

### Login en Wrangler
```bash
npx wrangler login
# Abre browser → autoriza con pradofox@sopadeletras.art
# Verifica acceso a ambas cuentas:
npx wrangler whoami
# Debe mostrar: Pradofox@sopadeletras.art's Account + Contacto@fcagency.mx's Account
```

### Verificar conexión a la D1 remota
```bash
npx wrangler d1 execute fc-admin --remote --command="SELECT COUNT(*) as c FROM modelos"
# Debe responder con el conteo (147 al momento de este handoff)
```

Si el comando falla con "database not found", revisa que `wrangler.toml` tenga:
```toml
account_id = "e4c8b06fcae74500b3b9c17a350953f4"
[[d1_databases]]
database_id = "f77ab0bc-02ef-42ed-b628-62eb21d8f0a4"
```

---

## 4. Setup local opcional (para probar antes de deployar)

```bash
# Si no tienes D1 local todavía:
npm run db:migrate:local

# Seed admin local con tu email:
npm run seed:admin -- pradofox@sopadeletras.art "Roberto Prado"

# Arranca dev server:
npm run dev
# http://localhost:4321
# Login: en consola del server sale el magic link (no usa Resend en dev por default)
```

---

## 5. Workflow típico de cambios

```bash
# 1. Pull lo último
git pull --rebase

# 2. Cambia código (con Claude Code te ayuda)
claude
# Le dices qué cambio quieres. Claude lee CLAUDE.md y demás docs primero.

# 3. Prueba local
npm run dev

# 4. Build (verifica que compile sin errores)
npm run build

# 5. Deploy a producción
npm run deploy

# 6. Commit + push (esto NO redeploya, ya deployó arriba; pero es para versionar)
git add -A
git commit -m "feat: descripción del cambio"
git push
```

Si haces cambio de schema (nueva migración):
```bash
# Crea migrations/00XX_descripcion.sql con CREATE/ALTER
# Aplica local
npm run db:migrate:local
# Aplica remoto
npm run db:migrate:prod
# Después deploy
npm run deploy
```

**NUNCA edites migraciones viejas**, solo crea nuevas. SQLite no acepta ALTER de CHECK constraints.

---

## 6. Comandos útiles cheatsheet

```bash
# Listar usuarios
npx wrangler d1 execute fc-admin --remote --command="SELECT email, nombre, rol FROM users"

# Generar token manual de login (cuando Resend no llega)
node -e "
const { randomBytes } = require('crypto');
const a = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const t = Array.from(randomBytes(32)).map(b => a[b % a.length]).join('');
console.log(t);
"
# Después insertarlo en auth_tokens con expires_at = Date.now() + 3600000

# Ver logs en vivo de producción
npx wrangler tail admin-fcagency

# Rollback a versión anterior (si rompes algo)
npx wrangler rollback admin-fcagency

# Ver versiones
npx wrangler deployments list
```

---

## 7. Documentación dentro del repo

Lee estos en orden cuando llegues:
1. `README.md` — overview
2. `CLAUDE.md` — convenciones para Claude Code (idioma, estética, stack)
3. `PRODUCCION.md` — estado vivo (URL, IDs, datos en prod)
4. `PLAN.md` — fases del proyecto y roadmap
5. `ARQUITECTURA.md` — modelo de datos y decisiones técnicas
6. `DESCUBRIMIENTOS.md` — análisis del comportamiento real de las 4 plataformas viejas
7. `PREGUNTAS-FELY.md` — decisiones pendientes con la dueña
8. **Este `HANDOFF.md`** — setup desde cero

---

## 8. Cuentas y URLs importantes

| Cosa | URL / valor |
|---|---|
| Producción | https://admin.fcagency.mx (alt: admin-fcagency.contacto-4c8.workers.dev) |
| Repo GitHub | https://github.com/pradofox/admin-fcagency |
| Cloudflare cuenta principal | `pradofox@sopadeletras.art` |
| Cloudflare cuenta FC Agency | `Contacto@fcagency.mx` (account_id `e4c8b06f...`) |
| D1 database id | `f77ab0bc-02ef-42ed-b628-62eb21d8f0a4` |
| Resend dashboard | https://resend.com (login con cuenta FC) |
| Firebase fc-agency consola | https://console.firebase.google.com |
| Squarespace domain | fcagency.mx |

---

## 9. Troubleshooting común

**Build falla con error TS:**
```bash
npm run build 2>&1 | grep -i error | head -20
```
Si es por tipos D1, regenera tipos:
```bash
npx wrangler types
```

**Deploy falla con "no subdomain":**
Ya está activado workers.dev en la cuenta FC. Si lo desactivaron, ir a https://dash.cloudflare.com/e4c8b06fcae74500b3b9c17a350953f4/workers/onboarding y registrar.

**D1 con `BEGIN TRANSACTION` error:**
D1 no acepta transacciones SQL directas en `wrangler d1 execute`. Quita esas líneas del SQL antes de aplicar.

**Magic link no llega por Resend:**
- Revisa Resend dashboard → Logs
- Verifica que el secret `RESEND_API_KEY` esté en wrangler:
  ```bash
  npx wrangler secret list
  ```
- Como fallback: genera token manual y métele a `auth_tokens` directo en D1.

**Migración con CHECK constraint falla:**
Los valores del SQL no encajan con los CHECK del schema. Limpiar/normalizar antes de aplicar.

**Cambios al deployar no aparecen:**
Hay cache de CF. Force refresh con Cmd+Shift+R. Si persiste, espera 1-2 min.

---

## 10. Si pierdes acceso a wrangler/CF

Es probable que necesites re-loguear desde la Mac nueva:
```bash
npx wrangler logout
npx wrangler login
# Abre browser, autoriza con tu cuenta personal
# Esto te da acceso a tu cuenta y a las cuentas donde eres Member
```

Si Fely te quita de Members de la cuenta FC Agency, pierdes deploy/D1 access. Las plataformas siguen funcionando pero no puedes mantenerlas. Háblalo con ella antes.

---

## 11. Para Fely (handoff a futuro)

Cuando ella quiera operar todo sin Roberto:
1. En su cuenta CF (la que ya tiene): Members → quitar a pradofox
2. Le pasa el repo: `gh repo transfer pradofox/admin-fcagency FC-Agency`
3. Ella instala Claude Code en su Mac (ver `handoff-fely-claude-code.md`)
4. Le pasa estas credenciales para Wrangler/D1: ya tiene todo en su cuenta CF
5. Puede pedir admin role para su user en la plataforma y desactivar el de Roberto

---

## Checklist final desde cero

- [ ] Brew + Node + git + gh + VS Code + Claude Code instalados
- [ ] gh logueado como pradofox
- [ ] claude logueado
- [ ] Repo clonado en `~/Code/admin-fcagency`
- [ ] `npm install` sin errores
- [ ] `npx wrangler whoami` muestra ambas cuentas
- [ ] `npx wrangler d1 execute fc-admin --remote --command="SELECT 1"` responde
- [ ] `npm run build` compila sin errores
- [ ] Abro https://admin-fcagency.contacto-4c8.workers.dev y puedo loguearme

Si todos los checks pasan, estás listo. Caso contrario, revisa la sección 9.
