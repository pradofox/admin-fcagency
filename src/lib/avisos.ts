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
        `SELECT m.nombre, m.email, lp.rol, lp.hora_llamado
         FROM lineas_produccion lp
         JOIN modelos m ON m.id = lp.modelo_id
         WHERE lp.produccion_id = ? AND lp.estado != 'cancelado'
           AND m.email IS NOT NULL AND TRIM(m.email) != ''`
      )
      .bind(prod.id)
      .all<any>();
    for (const r of results ?? [])
      out.push({ tipo: 'modelo', nombre: r.nombre, email: r.email.trim(), rol: r.rol, hora_llamado: r.hora_llamado });
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
  opts: { tipo: 'convocatoria' | 'recordatorio'; grupos: GrupoAviso[]; evitarDuplicados?: boolean; clienteNombre?: string | null }
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
