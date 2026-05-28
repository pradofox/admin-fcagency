# Descubrimientos del análisis de las 4 plataformas viejas

Análisis hecho en 2026-05-27 leyendo el código de los 4 HTMLs en producción para entender qué hacen REALMENTE (no qué deberían hacer). Este documento es la fuente de verdad sobre el comportamiento actual del ecosistema FC.

## El equipo real

| Persona | Plataforma que opera | Path Firebase |
|---|---|---|
| Vic | `fc-agency-produ` (Production System) | `producciones/` |
| Andrea M | `fc-agency-brand-content` (Brand & Content Strategy) | `andrea/` |
| Victoria | `fc-agency-community` (Tracker de Victoria) | `tracker/` |
| Renata Ondarza | `fc-agency-model-operation` (Gestión de Modelos) | `models/` |
| Fely | dueña, supervisión cross-marca | todas |

**OJO:** "Vic" (produ) y "Victoria" (community) son personas distintas. No confundir.

## Lo que hace cada plataforma

### `produ` — Vic
Crea producciones por día. Cada producción tiene un desglose de "proveedores" (cada uno con rol, nombre, cobro al cliente). El sistema calcula automáticamente pago al proveedor (80%) y utilidad (20%) por línea. Vista de pagos agrupados por día/semana/mes. Resumen de cuánto se debe a cada proveedor.

**Anti-patrones que encontré:**
- Split 80/20 hardcoded en el código (en realidad puede variar por agencia/rol).
- `provs` se guarda como array dentro del objeto producción; con `set()` del objeto raíz hay race condition garantizada con uso concurrente.
- Modelo se guarda como string libre (`modelo: "Mariana López"`), sin FK al roster de Renata.

### `brand-content` — Andrea M
Gestión editorial. Genera **briefs** y **piezas de contenido**. Al guardar un brief, automáticamente crea una pieza de contenido vinculada con estado `Pendiente`. Tracker de status por pieza. Registro de KPIs mensuales por marca (alcance, engagement, seguidores nuevos, guardados, DMs). Checklist global de QC editorial.

**Anti-patrones:**
- Usa Firebase v10 ESM modular (los otros 3 usan v9 compat). Inconsistencia.
- El checklist es global compartido — probable bug: debería ser por pieza.
- `creador` se guarda como string libre, sin FK.

### `community` — Victoria
CRM. Cada contacto tiene tipo (`Cliente | Modelo | Proveedor | Aspirante`), estatus de embudo (10 estados), y un array de pasos boolean (catálogo distinto por tipo: 14 pasos para Cliente, 10 para Modelo, 8 para Proveedor, 4 para Aspirante). Calendario de tareas pendientes con prioridad. Semáforos de pago cliente, pago modelo, material recibido, retro enviada.

**Anti-patrones:**
- Producción asociada se guarda como `prod` string libre, sin FK al sistema de Vic. Los pagos no se cruzan automáticamente.
- `steps[]` se reinicia si cambia el tipo de contacto.

### `model-operation` — Renata Ondarza
Roster de modelos con tracking de materiales pendientes (polas, book, videocasting, medidas, WhatsApp) y score de perfil 0-100%. Registro de trabajos por modelo (historial). Módulo de castings independiente con etapas (Abierto → Selección → Confirmado → Realizado).

**Anti-patrones:**
- Medidas se guardan como string libre con unidad ("1.70 cm", "85 cm").
- Cumpleaños como string libre ("14 junio 2004").
- `trabajos[]` denormalizado dentro del modelo — sin FK a bookings de Vic.
- Castings: `propuestos` es string libre CSV de nombres, no FK a roster.
- Hay referencia a un archivo `models_data.js` externo (seed inicial del roster) que NO está en el repo. **Hay que pedírselo a Fely antes de migrar datos.**

## Duplicaciones críticas

La duplicación es real y es el dolor principal del equipo:

1. **Modelo** existe en 3 lugares sin FK:
   - `produ.modelo` (string libre)
   - `produ.provs[].nombre` cuando el rol es "Modelo" (string libre)
   - `tracker.contactos.nombre` cuando tipo='Modelo' (string libre)
   - `models/roster/{id}.nombre` (entidad real, con datos completos)
   
   Cuando Renata da de alta una modelo, NO aparece en el sistema de Vic ni en el de Victoria. Cada quien la recaptura manualmente.

2. **Producción** existe en 2 lugares sin FK:
   - `producciones/ev_N` (entidad real de Vic)
   - `tracker.contactos.prod` (string libre de Victoria)
   
   Cuando Victoria marca "pago cliente cobrado", Vic no se entera.

3. **Cliente** no existe como entidad en ninguna parte:
   - Disuelto en strings (`produ.provs[]`, `tracker.contactos`, `models.castings.cliente`)
   - Repetido entre plataformas sin manera de cruzar.

4. **Marca**: 3 grafías distintas (`FCLINE` vs `FC Line` vs `FCLine`; `ALEAMODA` vs `Aleamoda`). Hay que normalizar.

5. **Pago modelo / proveedor**: 3 modelos distintos para el mismo flujo financiero:
   - `produ.provs[].pago80` (calculado, número)
   - `tracker.contactos.pagoM` (Sí/No)
   - `models.trabajos[].pago` (string libre "$X,XXX MXN")

## Lo que está RESUELTO en el schema nuevo (post-migraciones 0007-0016)

- ✅ Modelo único en `modelos` con FK desde `bookings`, `lineas_produccion`, `casting_modelos_propuestos`, `castings.modelo_seleccionado_id`, `trabajos_modelo`.
- ✅ Producción única en `producciones` con FK desde `contactos.produccion_id`, `lineas_produccion`, `acciones_calendario`.
- ✅ Cliente en su propia tabla con FK desde `producciones.cliente_id`.
- ✅ Marca catalogada en `marcas` con IDs limpios (`fc-agency`, `district-studio`, `aleamoda`, `voxoy`, `fc-line`).
- ✅ Pago calculado consistentemente en `lineas_produccion` con `comision_pct` configurable (default 20).
- ✅ CRM completo con `contacto_pasos`, semáforos, `estatus_crm`, `produccion_id` FK.
- ✅ Castings con `casting_modelos_propuestos` (n-n) y `modelo_seleccionado_id` (FK).
- ✅ Trabajos del modelo con `booking_id` opcional (para trabajos del sistema) o NULL (histórico externo).
- ✅ Briefs con todos los campos editoriales (audiencia, CTA, copy, hashtags, música, refs, deadline, creador asignado).
- ✅ Piezas de contenido con pilar.
- ✅ Campañas como entidad propia.
- ✅ KPIs de redes en tabla relacional.

## Lo que queda como DECISIÓN PENDIENTE (esperando a Fely)

| # | Decisión | Mi recomendación |
|---|---|---|
| 1 | ¿Comisión 80/20 fija o configurable por línea? | Configurable, default 20 (ya en schema). |
| 2 | Checklist de Andrea: ¿global compartido o por pieza? | Por pieza. Es bug que sea global. |
| 3 | Estado "En desarrollo" de modelos: ¿mapear a `aspirante` o agregar valor nuevo? | Agregar valor nuevo `en_desarrollo` al CHECK del enum estado. |
| 4 | Archivo `models_data.js`: ¿lo tiene Fely? Sin él, migración importa roster vacío. | Pedirlo antes de correr migración de datos. |
| 5 | Pasos del CRM por tipo: ¿catálogo del schema actual lo cubre? Hay que listar las cadenas exactas de los 14/10/8/4 pasos. | Extraer del HTML de community y crear seed `crm_pasos_catalogo`. Esto es trabajo pendiente. |
| 6 | KPI checklist global vs por pieza: ¿qué quiere Andrea? | Esperar a su respuesta. |
| 7 | Trabajos externos al sistema (pre-FC, freelance): ¿se siguen capturando o se ignoran? | Sí, capturarlos como `trabajos_modelo` con `booking_id NULL`. |

## Próximos pasos

- Construir las secciones de la plataforma nueva replicando los flujos reales (Producciones con líneas, Briefs con piezas, CRM con pasos, Castings).
- Script de migración Firebase → D1 que maneja las normalizaciones (marca, medidas, fechas) y las correlaciones (modelo por nombre, etc.).
- Cuando Fely esté lista, importar `models_data.js` para tener el roster real, no vacío.
