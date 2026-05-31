import { newId } from './ids';
import { now } from './db';
import { sendEmail, buildConvocatoriaHtml } from './email';
import { formatFecha } from './fechas';

export type GrupoAviso = 'modelos' | 'proveedores' | 'cliente';

interface Destinatario {
  tipo: 'modelo' | 'proveedor' | 'cliente';
  nombre: string | null;
  email: string;
  rol: string | null;
  hora_llamado: string | null;
  ics_token?: string | null;   // solo modelos: para suscribir calendario
  modelo_id?: string | null;   // solo modelos: para generar token si falta
}

/** Junta los destinatarios de una producción que tienen email. */
export async function recolectarDestinatarios(
  db: D1Database,
  prod: any,
  grupos: GrupoAviso[]
): Promise<Destinatario[]> {
  const out: Destinatario[] = [];

  if (grupos.includes('modelos')) {
    const { results } = await db
      .prepare(
        `SELECT m.id as modelo_id, m.nombre, m.email, m.ics_token, lp.rol, lp.hora_llamado
         FROM lineas_produccion lp
         JOIN modelos m ON m.id = lp.modelo_id
         WHERE lp.produccion_id = ? AND lp.estado != 'cancelado'
           AND m.email IS NOT NULL AND TRIM(m.email) != ''`
      )
      .bind(prod.id)
      .all<any>();
    for (const r of results ?? [])
      out.push({
        tipo: 'modelo', nombre: r.nombre, email: r.email.trim(), rol: r.rol, hora_llamado: r.hora_llamado,
        ics_token: r.ics_token, modelo_id: r.modelo_id,
      });
  }

  if (grupos.includes('proveedores')) {
    const { results } = await db
      .prepare(
        `SELECT p.nombre, p.email, lp.rol, lp.hora_llamado
         FROM lineas_produccion lp
         JOIN proveedores p ON p.id = lp.proveedor_id
         WHERE lp.produccion_id = ? AND lp.estado != 'cancelado'
           AND p.email IS NOT NULL AND TRIM(p.email) != ''`
      )
      .bind(prod.id)
      .all<any>();
    for (const r of results ?? [])
      out.push({ tipo: 'proveedor', nombre: r.nombre, email: r.email.trim(), rol: r.rol, hora_llamado: r.hora_llamado });
  }

  if (grupos.includes('cliente') && prod.cliente_id) {
    const cli = await db
      .prepare('SELECT nombre, email FROM clientes WHERE id = ?')
      .bind(prod.cliente_id)
      .first<any>();
    if (cli?.email && String(cli.email).trim())
      out.push({ tipo: 'cliente', nombre: cli.nombre, email: String(cli.email).trim(), rol: null, hora_llamado: null });
  }

  // Dedup por email (una persona puede estar en varias líneas)
  const seen = new Set<string>();
  return out.filter((d) => {
    const k = d.email.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

interface ResultadoEnvio {
  enviados: number;
  errores: number;
  detalles: { nombre: string | null; email: string; ok: boolean; error?: string; saltado?: boolean }[];
}

/**
 * Envía convocatoria o recordatorio a los grupos indicados y registra en notificaciones.
 * Si evitarDuplicados=true, no reenvía a quien ya recibió ese tipo para esa producción.
 */
export async function enviarAvisosProduccion(
  db: D1Database,
  prod: any,
  resendKey: string | undefined,
  opts: { tipo: 'convocatoria' | 'recordatorio'; grupos: GrupoAviso[]; evitarDuplicados?: boolean; clienteNombre?: string | null; appUrl?: string }
): Promise<ResultadoEnvio> {
  const destinatarios = await recolectarDestinatarios(db, prod, opts.grupos);
  const horario = prod.hora_inicio
    ? `${prod.hora_inicio}${prod.hora_fin ? ' – ' + prod.hora_fin : ''}`
    : null;
  const fecha = prod.fecha_inicio ? formatFecha(prod.fecha_inicio) : null;

  const res: ResultadoEnvio = { enviados: 0, errores: 0, detalles: [] };

  for (const d of destinatarios) {
    if (opts.evitarDuplicados) {
      const ya = await db
        .prepare(
          `SELECT id FROM notificaciones
           WHERE produccion_id = ? AND tipo = ? AND lower(email) = lower(?) AND estado = 'enviado' LIMIT 1`
        )
        .bind(prod.id, opts.tipo, d.email)
        .first<any>();
      if (ya) {
        res.detalles.push({ nombre: d.nombre, email: d.email, ok: true, saltado: true });
        continue;
      }
    }

    // Links de calendario para que el modelo se agregue solo el evento
    // (y opcionalmente suscriba el feed personal con todas sus producciones).
    let icsFeedUrl: string | null = null;
    let gcalEventUrl: string | null = null;
    if (d.tipo === 'modelo' && opts.appUrl) {
      let token = d.ics_token ?? null;
      if (!token && d.modelo_id) {
        // Generar token al vuelo si el modelo nunca tuvo uno
        token = crypto.randomUUID().replace(/-/g, '');
        await db.prepare('UPDATE modelos SET ics_token = ? WHERE id = ?').bind(token, d.modelo_id).run();
      }
      if (token) icsFeedUrl = `${opts.appUrl}/api/ics/modelo/${token}.ics`;

      // Google Calendar "agregar evento" URL (prelena un evento de medio dia
      // sin tiempo si no hay hora, o con hora si esta capturada).
      if (prod.fecha_inicio) {
        const ymd = (prod.fecha_inicio as string).slice(0, 10).replace(/-/g, '');
        let dates = `${ymd}/${ymd}`;
        if (prod.hora_inicio) {
          const hi = String(prod.hora_inicio).replace(':', '') + '00';
          const hf = prod.hora_fin ? String(prod.hora_fin).replace(':', '') + '00' : hi;
          dates = `${ymd}T${hi}/${ymd}T${hf}`;
        }
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: `${prod.titulo}${d.rol ? ' — ' + d.rol : ''}`,
          dates,
          details: `Producción FC Agency${opts.clienteNombre ? ' · ' + opts.clienteNombre : ''}${d.hora_llamado ? '\\nTu llamado: ' + d.hora_llamado : ''}${prod.notas ? '\\n\\n' + prod.notas : ''}`,
          location: [prod.ubicacion_shoot, prod.ubicacion_mua, prod.ubicacion].filter(Boolean).join(' · '),
        });
        gcalEventUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
      }
    }

    const html = buildConvocatoriaHtml({
      esRecordatorio: opts.tipo === 'recordatorio',
      saludoNombre: d.tipo === 'cliente' ? d.nombre : (d.nombre?.split(' ')[0] ?? null),
      rol: d.tipo === 'cliente' ? null : d.rol,
      horaLlamado: d.hora_llamado,
      produccionTitulo: prod.titulo,
      cliente: opts.clienteNombre ?? null,
      tipo: prod.tipo_produccion ?? null,
      fecha,
      horario,
      ubicacionMua: prod.ubicacion_mua ?? null,
      ubicacionShoot: prod.ubicacion_shoot ?? null,
      notas: prod.notas ?? null,
      icsFeedUrl,
      gcalEventUrl,
    });

    const subject = `${opts.tipo === 'recordatorio' ? 'Recordatorio' : 'Convocatoria'}: ${prod.titulo}${fecha ? ' · ' + fecha : ''}`;
    const r = await sendEmail({ to: d.email, subject, html }, resendKey);

    await db
      .prepare(
        `INSERT INTO notificaciones (id, produccion_id, tipo, destinatario_tipo, destinatario_nombre, email, estado, detalle, enviado_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(newId(), prod.id, opts.tipo, d.tipo, d.nombre, d.email, r.ok ? 'enviado' : 'error', r.error ?? null, now())
      .run();

    if (r.ok) res.enviados++;
    else res.errores++;
    res.detalles.push({ nombre: d.nombre, email: d.email, ok: r.ok, error: r.error });
  }

  return res;
}
