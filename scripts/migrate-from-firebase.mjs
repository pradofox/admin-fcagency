#!/usr/bin/env node
/**
 * Migración de datos: Firebase Realtime Database (fc-agency) → D1 (fc-admin).
 *
 * Lee los paths producciones/, andrea/, tracker/, models/ del Firebase actual
 * y produce un archivo SQL con INSERTs listos para aplicar a D1.
 *
 * USO:
 *   node scripts/migrate-from-firebase.mjs > migration-data.sql
 *   # revisar migration-data.sql
 *   npx wrangler d1 execute fc-admin --local --file=migration-data.sql
 *   # cuando estés lista para producción:
 *   npx wrangler d1 execute fc-admin --remote --file=migration-data.sql
 *
 * NOTAS:
 * - Lee Firebase como público (las reglas tienen que estar abiertas).
 * - NO toca Firebase, solo lee.
 * - Genera IDs nuevos (nanoid 16 chars) para D1 — NO reutiliza los IDs Firebase
 *   porque tienen formatos distintos por path (ev_N, c_TIMESTAMP, pushIds, etc.).
 * - Normaliza marcas a IDs canónicos: FCLINE/FC Line/FCLine → fc-line, ALEAMODA/Aleamoda → aleamoda.
 * - Parsea medidas tipo "1.70 cm" a número entero de cm.
 * - Trabajos del modelo: se importan a trabajos_modelo con booking_id NULL (sin atar a
 *   producciones por ahora; la correlación por nombre se puede hacer en una segunda pasada).
 * - Contactos: NO se importan los pasos (steps[]) hasta que Fely confirme el catálogo real.
 * - Castings: propuestos se importa solo como texto en notas porque son nombres libres.
 *
 * DECISIONES PENDIENTES:
 * - El archivo models_data.js del repo model-operation contiene el seed inicial.
 *   Este script no lo procesa — necesitamos esa info.
 */

import { randomBytes } from 'node:crypto';

const FIREBASE_URL = 'https://fc-agency-default-rtdb.firebaseio.com';

function nano(len = 16) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = randomBytes(len);
  let id = '';
  for (let i = 0; i < len; i++) id += alphabet[bytes[i] % alphabet.length];
  return id;
}

async function fetchJson(path) {
  const res = await fetch(`${FIREBASE_URL}/${path}.json`);
  if (!res.ok) {
    console.error(`-- ERROR fetching ${path}: ${res.status}`);
    return null;
  }
  return res.json();
}

function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}

function num(n) {
  if (n === null || n === undefined || n === '') return 'NULL';
  const x = Number(n);
  return Number.isFinite(x) ? String(x) : 'NULL';
}

function boolInt(v) {
  return v ? '1' : '0';
}

// Normaliza el nombre de marca a un ID del catálogo.
function marcaId(name) {
  if (!name) return null;
  const s = String(name).toLowerCase().replace(/\s+/g, '');
  if (s === 'fcagency') return 'fc-agency';
  if (s === 'districtstudio') return 'district-studio';
  if (s === 'aleamoda') return 'aleamoda';
  if (s === 'fcline') return 'fc-line';
  if (s === 'voxoy') return 'voxoy';
  return null;
}

// Parsea "1.70 cm" o "170 cm" → 170 (entero cm).
function parseMedida(s) {
  if (!s) return null;
  const m = String(s).match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  let n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  if (n < 10) n = n * 100; // "1.70" → 170
  return Math.round(n);
}

const out = [];
const now = Date.now();

// ============================================================
// PRODUCCIONES (Vic) — path: producciones/
// ============================================================
async function migrarProducciones() {
  const data = await fetchJson('producciones');
  if (!data) return;
  out.push('-- ==== Producciones (Vic) ====');
  for (const [fbKey, ev] of Object.entries(data)) {
    if (!ev || typeof ev !== 'object') continue;
    const id = nano();
    const titulo = ev.nombre || 'Sin nombre';
    const mid = marcaId(ev.agencia);
    out.push(
      `INSERT INTO producciones (id, titulo, marca_id, fecha_inicio, hora_inicio, hora_fin, ubicacion_mua, ubicacion_shoot, estado, notas, created_at, updated_at) VALUES (` +
        [esc(id), esc(titulo), esc(mid), esc(ev.fecha), esc(ev.inicio), esc(ev.fin), esc(ev.locmua), esc(ev.locshoot), `'planeacion'`, esc(ev.notas), now, now].join(', ') + `);`
    );
    if (Array.isArray(ev.provs)) {
      for (const p of ev.provs) {
        const lineaId = nano();
        out.push(
          `INSERT INTO lineas_produccion (id, produccion_id, rol, nombre_libre, cobro_cliente, comision_pct, estado, created_at) VALUES (` +
            [esc(lineaId), esc(id), esc(p.rol || 'Otro'), esc(p.nombre), num(p.cobro), '20.0', `'pendiente'`, now].join(', ') + `);`
        );
      }
    }
  }
}

// ============================================================
// BRAND CONTENT (Andrea) — path: andrea/
// ============================================================
async function migrarAndrea() {
  out.push('\n-- ==== Brand Content (Andrea M) ====');

  const briefs = await fetchJson('andrea/briefs');
  if (briefs) {
    for (const [, b] of Object.entries(briefs)) {
      if (!b) continue;
      const id = nano();
      const mid = marcaId(b.marca);
      out.push(
        `INSERT INTO briefs (id, titulo, marca_id, pilar, descripcion, objetivo, audiencia, cta, copy, hashtags, musica, refs_visuales, creador_asignado, formato, fecha_publicacion, deadline, plataforma, estado, created_at, updated_at) VALUES (` +
          [
            esc(id), esc(b.nombre || 'Sin título'), esc(mid), esc(b.pilar), esc(b.notas),
            esc(b.objetivo), esc(b.audiencia), esc(b.cta), esc(b.copy), esc(b.hashtags),
            esc(b.musica), esc(b.refs), esc(b.creador), esc(b.formato), esc(b.fecha),
            esc(b.deadline), esc(b.plataforma), `'idea'`, num(b.ts || now), now
          ].join(', ') + `);`
      );
    }
  }

  const contenido = await fetchJson('andrea/contenido');
  if (contenido) {
    for (const [, c] of Object.entries(contenido)) {
      if (!c) continue;
      const id = nano();
      const mid = marcaId(c.marca);
      out.push(
        `INSERT INTO piezas_contenido (id, marca_id, titulo, formato, plataforma, pilar, fecha_programada, estado, notas, created_at, updated_at) VALUES (` +
          [esc(id), esc(mid), esc(c.nombre || 'Sin título'), esc(c.formato), esc(c.plataforma), esc(c.pilar), esc(c.fecha), esc(c.estado || 'programado'), esc(c.notas), num(c.ts || now), now].join(', ') + `);`
      );
    }
  }

  const campanas = await fetchJson('andrea/campanas');
  if (campanas) {
    for (const [, c] of Object.entries(campanas)) {
      if (!c) continue;
      const id = nano();
      const mid = marcaId(c.marca);
      out.push(
        `INSERT INTO campanas (id, nombre, marca_id, tipo, fecha_inicio, fecha_fin, objetivo, estado, created_at, updated_at) VALUES (` +
          [esc(id), esc(c.nombre || 'Sin nombre'), esc(mid), esc(c.tipo), esc(c.inicio), esc(c.fin), esc(c.objetivo), esc(c.estado || 'Activa'), num(c.ts || now), now].join(', ') + `);`
      );
    }
  }

  const kpis = await fetchJson('andrea/kpis');
  if (kpis) {
    for (const [, k] of Object.entries(kpis)) {
      if (!k) continue;
      const id = nano();
      const mid = marcaId(k.marca);
      out.push(
        `INSERT INTO kpis_redes (id, fecha, marca_id, alcance, engagement_pct, seguidores_nuevos, guardados, dms, notas, created_at) VALUES (` +
          [esc(id), esc(k.fecha), esc(mid), num(k.reach), num(k.eng), num(k.seg), num(k.saves), num(k.dms), esc(k.notes), num(k.ts || now)].join(', ') + `);`
      );
    }
  }
}

// ============================================================
// COMMUNITY / TRACKER (Victoria) — path: tracker/
// ============================================================
async function migrarTracker() {
  out.push('\n-- ==== CRM Tracker (Victoria) ====');
  const contactos = await fetchJson('tracker/contactos');
  if (contactos) {
    for (const [fbKey, c] of Object.entries(contactos)) {
      if (!c) continue;
      const id = nano();
      const mid = marcaId(c.marca);
      const tipo = (c.tipo || 'cliente').toLowerCase();

      const estatusMap = {
        'nuevo contacto': 'nuevo_contacto',
        'cotización enviada': 'cotizacion_enviada',
        'en negociación': 'en_negociacion',
        'confirmado': 'confirmado',
        'en producción': 'en_produccion',
        'post producción': 'post_produccion',
        'pago pendiente': 'pago_pendiente',
        'retro pendiente': 'retro_pendiente',
        'material pendiente': 'material_pendiente',
        'cerrado': 'cerrado'
      };
      const estatus = estatusMap[String(c.estatus || '').toLowerCase()] ?? 'nuevo_contacto';

      const pagoCMap = { 'pendiente': 'pendiente', 'anticipo recibido': 'anticipo_recibido', 'pagado': 'pagado', 'no aplica': 'no_aplica' };
      const pagoC = pagoCMap[String(c.pagoC || '').toLowerCase()] ?? 'pendiente';

      const pagoMMap = { 'por pagar': 'por_pagar', 'pagado': 'pagado', 'no aplica': 'no_aplica' };
      const pagoM = pagoMMap[String(c.pagoM || '').toLowerCase()] ?? 'por_pagar';

      out.push(
        `INSERT INTO contactos (id, nombre, tipo, marca_id, canal, estatus_crm, pago_cliente_estado, pago_modelo_estado, material_recibido, retro_enviada, next_action_date, next_action_text, notas, created_at, updated_at) VALUES (` +
          [
            esc(id), esc(c.nombre), esc(tipo), esc(mid), esc(c.canal),
            esc(estatus), esc(pagoC), esc(pagoM),
            boolInt(c.material === 'Sí'), boolInt(c.retro === 'Sí'),
            esc(c.nextDate), esc(c.paso), esc(c.notas), now, now
          ].join(', ') + `);`
      );
    }
  }

  const calendario = await fetchJson('tracker/calendario');
  if (calendario) {
    for (const [, cal] of Object.entries(calendario)) {
      if (!cal) continue;
      const id = nano();
      out.push(
        `INSERT INTO acciones_calendario (id, fecha, tarea, prioridad, done, created_at) VALUES (` +
          [esc(id), esc(cal.fecha), esc(cal.tarea), esc(cal.priority || 'Media'), boolInt(cal.done), now].join(', ') + `);`
      );
    }
  }
}

// ============================================================
// MODEL OPERATION (Renata Ondarza) — path: models/
// ============================================================
async function migrarModelos() {
  out.push('\n-- ==== Modelos (Renata Ondarza) ====');
  const roster = await fetchJson('models/roster');
  if (roster) {
    const estadoMap = { 'activo': 'activo', 'en desarrollo': 'aspirante', 'en pausa': 'pausa', 'inactivo': 'archivado' };

    for (const [, m] of Object.entries(roster)) {
      if (!m) continue;
      const id = nano();
      const estado = estadoMap[String(m.estado || '').toLowerCase()] ?? 'activo';
      const medidas = m.medidas || {};
      out.push(
        `INSERT INTO modelos (id, nombre, email, whatsapp, instagram, cumpleanos, edad, estatura_cm, busto_cm, cintura_cm, cadera_cm, cabello, ojos, ciudad, notas, polas, book, videocasting, sitio_web, drive_folder, ultima_junta_1x1, estado, created_at, updated_at) VALUES (` +
          [
            esc(id), esc(m.nombre), esc(m.email), esc(m.whatsapp), esc(m.instagram),
            esc(m.cumple), num(m.edad),
            num(parseMedida(medidas.estatura)), num(parseMedida(medidas.busto)),
            num(parseMedida(medidas.cintura)), num(parseMedida(medidas.cadera)),
            esc(null), esc(null), esc(null), esc(m.notas),
            boolInt(m.polas), boolInt(m.book), boolInt(m.videocasting),
            esc(m.web), esc(m.drive), esc(m.ultima_junta),
            esc(estado), now, now
          ].join(', ') + `);`
      );

      if (Array.isArray(m.trabajos)) {
        for (const t of m.trabajos) {
          const tid = nano();
          out.push(
            `INSERT INTO trabajos_modelo (id, modelo_id, tipo, cliente, fecha, horas, pago_mxn, notas, created_at) VALUES (` +
              [esc(tid), esc(id), esc(t.tipo || 'Otro'), esc(t.cliente), esc(t.fecha), num(t.horas), num(String(t.pago || '').replace(/[^0-9.]/g, '')), esc(t.nota), now].join(', ') + `);`
          );
        }
      }
    }
  }

  const castings = await fetchJson('models/castings');
  if (castings) {
    for (const [, c] of Object.entries(castings)) {
      if (!c) continue;
      const id = nano();
      const notas = [c.notas, c.propuestos ? `Propuestos: ${c.propuestos}` : null, c.seleccionado ? `Seleccionado: ${c.seleccionado}` : null].filter(Boolean).join(' | ');
      out.push(
        `INSERT INTO castings (id, cliente, tipo, fecha, hora, lugar, perfil, pago_modelo, etapa, notas, created_at, updated_at) VALUES (` +
          [
            esc(id), esc(c.cliente), esc(c.tipo), esc(c.fecha), esc(c.hora),
            esc(c.lugar), esc(c.perfil),
            num(String(c.pago || '').replace(/[^0-9.]/g, '')),
            esc(c.etapa || 'Abierto'),
            esc(notas), now, now
          ].join(', ') + `);`
      );
    }
  }
}

// ============================================================
// Run
// ============================================================
out.push('-- Migración de datos Firebase fc-agency → D1 fc-admin');
out.push(`-- Generado: ${new Date().toISOString()}`);
out.push('-- Aplicar con: npx wrangler d1 execute fc-admin --local --file=migration-data.sql');
out.push('-- (o --remote para producción)');
out.push('');
out.push('BEGIN TRANSACTION;');

await migrarProducciones();
await migrarAndrea();
await migrarTracker();
await migrarModelos();

out.push('');
out.push('COMMIT;');
out.push('');
out.push('-- FIN');

console.log(out.join('\n'));
