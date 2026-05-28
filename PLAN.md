# Plan de construcción admin-fcagency

## Fase 0 — Diseño de datos y roles ✅ HECHA

Schema final con 16 migraciones, 17 tablas relacionales validadas contra el comportamiento real de las 4 plataformas viejas.

Roles: `admin`, `editor`, `viewer`. Cada user tiene un campo `marcas` (JSON array) que limita scope.

Ver `DESCUBRIMIENTOS.md` para el análisis profundo que validó el schema.

## Fase 1 — Scaffolding ✅ HECHA

- Astro + CF + D1 + auth custom magic link
- Layout, sidebar con 8 secciones
- Documentación completa (CLAUDE, ARQUITECTURA, DESCUBRIMIENTOS, PREGUNTAS, README, este PLAN)

## Fase 2 — Secciones funcionales ✅ HECHA (en greenfield)

Todas las secciones tienen UI funcional construida espejando los flujos reales de las plataformas viejas:

- **Modelos** — lista con filtros, alta, edit, eliminar. Schema extendido con polas/book/videocasting/sitio_web/drive_folder/última_junta.
- **Producciones** — lista con filtros, alta, edit, eliminar + **gestión de líneas de proveedores** con cobro/comisión/pago calculado automático + semáforo pendiente/pagado/cancelado por línea. Reemplaza el patrón 80/20 hardcoded de Vic.
- **Castings** — lista con filtros por etapa + alta inline. Reemplaza el módulo de castings de Renata.
- **Briefs** — lista con filtros por estado y marca, alta, edit + **autocrea pieza de contenido** al guardar brief con fecha de publicación (replicando el flujo de Andrea).
- **Contenido** — calendario de piezas con filtros por estado.
- **Contactos / CRM** — lista con filtros por tipo y estatus, alta inicializando pasos según tipo, detalle con **checklist de pasos + semáforos de pago/material/retro + estatus CRM editable + próximas acciones**.
- **Clientes** — placeholder (esquema listo, UI pendiente).
- **Dashboard** — métricas reales: modelos activas, producciones en curso, castings abiertos, briefs vivos, piezas por publicar, contactos con pago pendiente, próximas acciones cross-sección.

## Fase 3 — Migración de datos desde Firebase ✅ SCRIPT LISTO

`scripts/migrate-from-firebase.mjs` lee los paths `producciones/`, `andrea/`, `tracker/`, `models/` y genera SQL listo para aplicar a D1.

Maneja normalizaciones:
- Marca: `FCLINE`/`FC Line`/`FCLine` → `fc-line`, `ALEAMODA`/`Aleamoda` → `aleamoda`
- Medidas: `"1.70 cm"` → `170` (INTEGER cm)
- Estados de modelo: `En desarrollo` → `aspirante`
- Estatus CRM: convierte texto humano a snake_case del CHECK
- Boolean: `"Sí"` → `1`

Pendiente confirmar con Fely:
- Archivo `models_data.js` del repo model-operation (seed inicial del roster). Sin él la migración importa solo los modelos que ya viven en Firebase.
- Catálogo exacto de pasos del CRM por tipo (hoy hay un tentativo en `src/lib/crm-pasos.ts`).

Para correr:
```bash
npm run migrate:firebase
# Genera migration-data.sql en raíz
# Revisar el SQL antes de aplicar
npx wrangler d1 execute fc-admin --local --file=migration-data.sql
```

## Fase 4 — Sunset platforms viejas (pendiente)

Una vez admin-fcagency esté corriendo con datos migrados y el equipo lo esté usando:

1. Los 5 sitios Netlify viejos hacen redirect 301 a `admin.fcagency.mx/<seccion>`
2. Firebase queda como backup leído pero no escrito
3. Después de 30 días sin reportes, apagar Firebase RTDB
4. Archivar repos viejos en GitHub

## Pendientes inmediatos para arrancar localmente

```bash
git clone https://github.com/pradofox/admin-fcagency.git
cd admin-fcagency
npm install
npx wrangler login
npx wrangler d1 create fc-admin
# pegar database_id en wrangler.toml
npm run db:migrate:local
npm run seed:admin -- tu@email.com "Tu Nombre"
npm run dev
# http://localhost:4321
```

## Decisiones pendientes con Fely

Ver `DESCUBRIMIENTOS.md` sección "DECISIÓN PENDIENTE" y `PREGUNTAS-FELY.md`.

Las más críticas:
1. Catálogo real de pasos del CRM por tipo
2. Archivo `models_data.js` con seed del roster
3. ¿Comisión 80/20 fija o configurable? (ya configurable en schema, default 20)
4. ¿Checklist de Andrea global o por pieza? (decisión arquitectónica)

## Riesgos conocidos

- **Migración 1:1:** algunos campos del Firebase actual son strings libres ambiguos (modelo, cliente, prod). El script los preserva pero no los correlaciona. Una segunda pasada manual (o asistida por Claude Code) puede deduplicar.
- **No probé `npm install` ni `npm run build`** en este scaffolding. Habrá 1-2 errores típicos de TypeScript en el primer build que se arreglan en minutos.
