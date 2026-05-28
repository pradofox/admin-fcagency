import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db';
import { getUser } from '../../../lib/session';

export const GET: APIRoute = async (context) => {
  const user = getUser(context);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const q = (context.url.searchParams.get('q') ?? '').trim();
  if (q.length < 2) return new Response('[]', { headers: { 'Content-Type': 'application/json' } });

  const db = getDB(context);
  const like = `%${q}%`;
  const { results } = await db
    .prepare(
      `SELECT id, nombre, instagram, ciudad FROM modelos
       WHERE (nombre LIKE ? OR instagram LIKE ?)
       ORDER BY nombre LIMIT 20`
    )
    .bind(like, like)
    .all<any>();

  return new Response(JSON.stringify(results ?? []), {
    headers: { 'Content-Type': 'application/json' }
  });
};
