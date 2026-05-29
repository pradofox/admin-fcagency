import type { APIContext } from 'astro';
import { getDB } from '../../../../lib/db';

// Feed .ics público (autenticado por token, no por sesión) con la agenda de
// producciones de un modelo. Suscribible en Google Calendar / Apple Calendar.
// Ruta pública declarada en src/middleware.ts (/api/ics).

function esc(s: string): string {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function ymd(fecha: string): string | null {
  // fecha en formato ISO YYYY-MM-DD -> YYYYMMDD
  if (!fecha) return null;
  const m = fecha.slice(0, 10).replace(/-/g, '');
  return /^\d{8}$/.test(m) ? m : null;
}

function nextDay(yyyymmdd: string): string {
  const y = Number(yyyymmdd.slice(0, 4));
  const mo = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  const dt = new Date(Date.UTC(y, mo - 1, d + 1));
  return dt.toISOString().slice(0, 10).replace(/-/g, '');
}

export async function GET(context: APIContext): Promise<Response> {
  const db = getDB(context);
  const token = context.params.token as string;

  const modelo = token
    ? await db.prepare('SELECT id, nombre FROM modelos WHERE ics_token = ?').bind(token).first<any>()
    : null;

  if (!modelo) {
    return new Response('Calendario no encontrado.', { status: 404 });
  }

  const { results: filas } = await db
    .prepare(
      `SELECT lp.rol, p.id as prod_id, p.titulo, p.fecha_inicio, p.fecha_fin,
              p.estado, p.tipo_produccion, p.ubicacion, cl.nombre as cliente
       FROM lineas_produccion lp
       JOIN producciones p   ON p.id = lp.produccion_id
       LEFT JOIN clientes cl ON cl.id = p.cliente_id
       WHERE lp.modelo_id = ? AND lp.estado != 'cancelado'
         AND p.estado != 'cancelada' AND p.fecha_inicio IS NOT NULL
       ORDER BY p.fecha_inicio ASC`
    )
    .bind(modelo.id)
    .all<any>();

  const dtstamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FC Agency//Agenda Modelo//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:FC Agency · ${esc(modelo.nombre)}`,
    'X-WR-TIMEZONE:America/Mexico_City',
  ];

  for (const f of (filas ?? [])) {
    const start = ymd(f.fecha_inicio);
    if (!start) continue;
    const endSrc = f.fecha_fin ? ymd(f.fecha_fin) : null;
    const end = endSrc ? nextDay(endSrc) : nextDay(start);
    const partes = [
      f.cliente ? `Cliente: ${f.cliente}` : null,
      f.tipo_produccion ? `Tipo: ${f.tipo_produccion}` : null,
      f.rol ? `Rol: ${f.rol}` : null,
      f.estado ? `Estado: ${f.estado}` : null,
    ].filter(Boolean).join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${f.prod_id}-${modelo.id}@fcagency.mx`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${esc(f.titulo)}${f.cliente ? ' · ' + esc(f.cliente) : ''}`,
      `DESCRIPTION:${partes}`,
      ...(f.ubicacion ? [`LOCATION:${esc(f.ubicacion)}`] : []),
      `STATUS:${f.estado === 'confirmada' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  const body = lines.join('\r\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="fcagency-${modelo.id}.ics"`,
      'Cache-Control': 'public, max-age=900',
    },
  });
}
