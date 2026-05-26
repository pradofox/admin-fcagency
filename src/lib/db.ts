import type { APIContext, AstroGlobal } from 'astro';

/**
 * Helper para acceder a la D1 desde un contexto Astro (página o API endpoint).
 * Funciona tanto en producción (CF Workers) como en dev (platformProxy).
 */
export function getDB(context: APIContext | AstroGlobal): D1Database {
  const runtime = (context.locals as any).runtime;
  const db = runtime?.env?.DB;
  if (!db) {
    throw new Error('D1 binding "DB" no disponible. Verifica wrangler.toml y que la base esté creada.');
  }
  return db;
}

/** Timestamp en milisegundos. */
export function now(): number {
  return Date.now();
}
