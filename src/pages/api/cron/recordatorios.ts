import type { APIRoute } from 'astro';
import { enviarAvisosProduccion } from '../../../lib/avisos';
import { sendEmail } from '../../../lib/email';
import { diasAlCumple, calcularEdad, cumpleCorto } from '../../../lib/fechas';

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

  // ── Recordatorio de cumpleaños a admins ────────────────────────────────────
  // Avisa cuando el cumpleaños de un modelo cae en 7, 1 o 0 días.
  const UMBRALES = [7, 1, 0];
  const { results: mods } = await db
    .prepare(`SELECT nombre, cumpleanos FROM modelos
              WHERE estado != 'archivado' AND cumpleanos IS NOT NULL AND TRIM(cumpleanos) != ''`)
    .all<any>();
  const cumplesProximos = (mods ?? [])
    .map((mo: any) => ({ nombre: mo.nombre, dias: diasAlCumple(mo.cumpleanos), edad: calcularEdad(mo.cumpleanos), cuando: cumpleCorto(mo.cumpleanos) }))
    .filter((x: any) => x.dias != null && UMBRALES.includes(x.dias))
    .sort((a: any, b: any) => a.dias - b.dias);

  let cumpleEmails = 0;
  if (cumplesProximos.length > 0) {
    const { results: admins } = await db
      .prepare(`SELECT email, nombre FROM users WHERE rol = 'admin' AND activo = 1 AND email IS NOT NULL`)
      .all<any>();
    const filas = cumplesProximos.map((x: any) => {
      const cuandoTxt = x.dias === 0 ? 'HOY' : x.dias === 1 ? 'mañana' : `en ${x.dias} días`;
      const edadTxt = x.edad != null ? ` cumple ${x.edad + (x.dias === 0 ? 0 : 1)}` : '';
      return `<tr><td style="padding:6px 0;color:#F5F5F5;font-size:13px">${x.nombre}</td><td style="padding:6px 0;color:#E5E5E5;font-size:13px">${cuandoTxt}${edadTxt}</td><td style="padding:6px 0;color:#808080;font-size:12px">${x.cuando ?? ''}</td></tr>`;
    }).join('');
    const html = `<!DOCTYPE html><html><body style="background:#080808;color:#F5F5F5;font-family:'Inter',system-ui,sans-serif;padding:40px 20px;margin:0">
      <div style="max-width:520px;margin:0 auto;background:#0E0E0E;border:1px solid #262626;border-radius:6px;padding:36px 32px">
        <div style="font-size:13px;font-weight:600;color:#E5E5E5;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px">FC Agency · Cumpleaños de modelos</div>
        <p style="font-size:14px;line-height:1.6;margin:0 0 18px;color:#B3B3B3">Próximos cumpleaños:</p>
        <table style="width:100%;border-collapse:collapse">${filas}</table>
      </div></body></html>`;
    for (const a of admins ?? []) {
      const r = await sendEmail({ to: a.email, subject: '🎂 Próximos cumpleaños de modelos', html }, resendKey);
      if (r.ok) cumpleEmails++;
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      fecha: fechaObjetivo,
      producciones: (prods ?? []).length,
      enviados: totalEnviados,
      errores: totalErrores,
      detalle: resumen,
      cumpleanos: { proximos: cumplesProximos, emails_admins: cumpleEmails },
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
