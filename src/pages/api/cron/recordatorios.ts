import type { APIRoute } from 'astro';
import { enviarAvisosProduccion } from '../../../lib/avisos';

/**
 * Recordatorios automáticos del día siguiente.
 * Protegido por secreto: pasar ?key=... que coincida con CRON_SECRET.
 * Pensado para un Cloudflare Cron Trigger o llamada manual.
 *
 * Por seguridad, por defecto NO envía al cliente (solo modelos y proveedores).
 * Para incluir cliente: &cliente=1
 */
export const GET: APIRoute = async (context) => {
  const runtime = (context.locals as any).runtime;
  const env = runtime?.env ?? {};
  const url = new URL(context.request.url);

  const secret = env.CRON_SECRET;
  const provided = url.searchParams.get('key') ?? context.request.headers.get('x-cron-key');
  if (!secret || provided !== secret) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = env.DB as D1Database | undefined;
  if (!db) {
    return new Response(JSON.stringify({ ok: false, error: 'no db' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incluirCliente = url.searchParams.get('cliente') === '1';
  const grupos = incluirCliente
    ? (['modelos', 'proveedores', 'cliente'] as const)
    : (['modelos', 'proveedores'] as const);

  // ¿qué día recordar? por defecto mañana (offset en días vía ?dias=)
  const dias = Number(url.searchParams.get('dias') ?? '1');
  const target = new Date();
  target.setUTCDate(target.getUTCDate() + (Number.isFinite(dias) ? dias : 1));
  const fechaObjetivo = target.toISOString().slice(0, 10);

  const { results: prods } = await db
    .prepare(
      `SELECT * FROM producciones
       WHERE fecha_inicio = ? AND (estado IS NULL OR estado != 'cancelada')`
    )
    .bind(fechaObjetivo)
    .all<any>();

  const resendKey = env.RESEND_API_KEY;
  const resumen: any[] = [];
  let totalEnviados = 0;
  let totalErrores = 0;

  for (const prod of prods ?? []) {
    const cli = prod.cliente_id
      ? await db.prepare('SELECT nombre FROM clientes WHERE id = ?').bind(prod.cliente_id).first<any>()
      : null;
    const r = await enviarAvisosProduccion(db, prod, resendKey, {
      tipo: 'recordatorio',
      grupos: [...grupos],
      evitarDuplicados: true,
      clienteNombre: cli?.nombre ?? null,
    });
    totalEnviados += r.enviados;
    totalErrores += r.errores;
    resumen.push({ produccion: prod.titulo, enviados: r.enviados, errores: r.errores });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      fecha: fechaObjetivo,
      producciones: (prods ?? []).length,
      enviados: totalEnviados,
      errores: totalErrores,
      detalle: resumen,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
