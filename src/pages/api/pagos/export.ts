import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { getUser } from '../../../lib/session';

export const GET: APIRoute = async (context) => {
  const user = getUser(context);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const db = getDB(context);
  const { results } = await db
    .prepare(
      `SELECT
         p.titulo as produccion,
         p.fecha_inicio,
         p.marca_id,
         lp.rol,
         COALESCE(lp.nombre_libre, '') as proveedor,
         lp.cobro_cliente,
         lp.comision_pct,
         lp.pago_proveedor,
         lp.estado
       FROM lineas_produccion lp
       JOIN producciones p ON p.id = lp.produccion_id
       ORDER BY p.fecha_inicio DESC, lp.created_at`
    )
    .all<any>();

  const headers = ['produccion', 'fecha', 'marca', 'rol', 'proveedor', 'cobro_cliente', 'comision_pct', 'pago_proveedor', 'estado'];
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = (results ?? []).map((r: any) => [
    r.produccion, r.fecha_inicio, r.marca_id, r.rol, r.proveedor,
    r.cobro_cliente, r.comision_pct, r.pago_proveedor, r.estado
  ].map(escape).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pagos-fc-agency-${today}.csv"`
    }
  });
};
