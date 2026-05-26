# Arquitectura

## Visión general

Astro app server-rendered (no SPA pesada). Backend en Cloudflare Workers. DB en Cloudflare D1 (SQLite serverless). Auth propio con magic link, sin libraries.

## Diagrama de capas

```
Browser
  ↕
Cloudflare Workers (Astro app server-rendered)
  ├─ src/middleware.ts          (valida sesión en cada request)
  ├─ src/pages/*.astro          (rendering server-side)
  └─ src/pages/api/*.ts         (endpoints REST)
  ↕
Cloudflare D1 (SQLite serverless)
  ├─ users, sessions, auth_tokens     (auth)
  ├─ marcas                           (catálogo: FC, District, AleaModa, etc.)
  ├─ modelos                          (perfiles, medidas)
  ├─ producciones + bookings + clientes  (Vic)
  ├─ briefs + piezas_contenido        (Andrea)
  └─ contactos                        (CRM cross-marca)
```

## Modelo de datos (relaciones clave)

```
users.id ───┬─── sessions.user_id
            ├─── modelos.created_by
            └─── briefs.created_by

marcas.id ──┬─── clientes.marca_id
            ├─── producciones.marca_id
            ├─── briefs.marca_id
            ├─── piezas_contenido.marca_id
            └─── contactos.marca_id

modelos.id ─── bookings.modelo_id ─── producciones.id

briefs.id ──── piezas_contenido.brief_id

clientes.id ── producciones.cliente_id
```

Ver `schema.sql` para definiciones completas.

## Auth flow

```
1. GET /login                        → form de email
2. POST /api/auth/login {email}      → si user existe: crea token,
                                       inserta en auth_tokens,
                                       manda email con /auth/verify?token=X
                                       (en dev: console.log)
                                     → redirect a /login-enviado
3. GET /login-enviado                → "revisa tu correo"
4. GET /auth/verify?token=X          → consume token, crea sesión,
                                       set cookie HttpOnly Secure SameSite=Lax
                                     → redirect /dashboard
5. (cada request)
   middleware.ts                     → lee cookie, valida sesión,
                                       carga user en Astro.locals.user
6. GET /logout                       → borra sesión de DB y cookie
                                     → redirect /login
```

Tokens expiran en 15 min. Sesiones en 30 días. Cookie es `fc_session`.

Si el email no existe en `users` o `activo=0`, el flujo retorna 200 igual (sin leak de qué emails están dados de alta) pero no se manda nada.

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| Astro sin React/Vue | Server-rendered es suficiente. Menos JS al cliente, mejor perf, menos complejidad. Componentes con `.astro`. |
| Sin Tailwind | CSS vanilla es portable, sin build step extra. Estilos en `src/styles/global.css` con variables CSS. |
| Sin auth library | Magic link es ~150 líneas de código propio. Auditable, sin lock-in, sin updates rompiendo cosas. |
| D1 sobre Firebase | SQL relacional, queries con joins, transacciones, sin race conditions, no lo bloquean adblockers. |
| CF Workers sobre Netlify/Vercel | Stack ya conocido del equipo Roberto. Edge global. D1 nativo. `wrangler` simple. |
| Magic link sobre password | No hay que manejar reset, hash, ni leak de credenciales. Más simple y más seguro. |
| Cookie HttpOnly | Imposible robarla con XSS. SameSite=Lax previene CSRF en navegación cross-site. |
| Una migration por feature | Schema versionado y reproducible. Nunca editar migrations viejas. |
| Sin frameworks de UI | Less is more. CSS variables + componentes Astro cubren todo. |
| `nanoid` para IDs | 16 chars URL-safe, sin colisiones, sin necesidad de UUID parser. |

## Performance esperado

- D1 cold start: ~100ms en la primera request por región
- D1 query simple: 5-15ms
- Renderizado Astro: <10ms para páginas como la lista de modelos
- TTFB típico: 100-200ms desde Monterrey (CF tiene PoP en MTY)

Si una pantalla específica necesita más, se considera cache con KV. No optimizar antes de tiempo.

## Seguridad

- Auth: magic link + cookie HttpOnly Secure SameSite=Lax
- Escape XSS: confiar en `{}` de Astro (escapa por default)
- SQL injection: solo queries con `.bind()`, nunca interpolación
- Rate limiting: pendiente (puede ser via CF Rules en el dashboard)
- Datos sensibles: vivirán en D1 que está dentro de la cuenta CF, no expuesto a clientes ni indexable

## Lo que NO es esta arquitectura

- No es un SaaS multi-tenant. Es un admin interno para FC Agency.
- No es realtime. Es server-rendered con refresh manual.
- No es offline-first. Requiere conexión.
- No es mobile-app. Es web responsive.
- No es público. Toda ruta requiere auth (excepto `/login*` y `/auth/verify`).
