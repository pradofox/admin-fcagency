import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { getUser } from '../../../lib/session';

export const GET: APIRoute = async (context) => {
  const user = getUser(context);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const db = getDB(context);
  const { results } = await db
    .prepare(
      `SELECT nombre, email, whatsapp, instagram, ciudad, estado, edad,
              estatura_cm, busto_cm, cintura_cm, cadera_cm, cabello, ojos,
              polas, book, videocasting, ultima_junta_1x1, notas
       FROM modelos ORDER BY nombre`
    )
    .all<any>();

  const headers = [
    'nombre', 'email', 'whatsapp', 'instagram', 'ciudad', 'estado', 'edad',
    'estatura_cm', 'busto_cm', 'cintura_cm', 'cadera_cm', 'cabello', 'ojos',
    'polas', 'book', 'videocasting', 'ultima_junta_1x1', 'notas'
  ];
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = (results ?? []).map((r: any) => headers.map((h) => escape(r[h])).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="modelos-fc-agency-${today}.csv"`
    }
  });
};
