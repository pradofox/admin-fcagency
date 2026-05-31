import { newId, newToken } from './ids';
import { now } from './db';
import type { SessionUser } from '../env';

const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 min
const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas para invitaciones
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
export const SESSION_COOKIE = 'fc_session';

interface UserRow {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'editor' | 'viewer';
  marcas: string | null;
  activo: number;
}

/**
 * Genera un magic-link token para el email.
 *
 * Auto-registro temporal: si el email no existe, crea cuenta con rol 'viewer'.
 * Esto facilita el onboarding inicial del equipo. Cuando todos estén dentro,
 * un admin puede deshabilitar este comportamiento volviendo al check estricto.
 *
 * Si el usuario existe pero está inactivo (activo = 0), retorna null sin crear token.
 */
export async function createAuthToken(db: D1Database, email: string): Promise<string | null> {
  const emailNorm = email.trim().toLowerCase();
  let user = await db
    .prepare('SELECT id, activo FROM users WHERE email = ?')
    .bind(emailNorm)
    .first<{ id: string; activo: number }>();

  if (user && !user.activo) return null;

  if (!user) {
    // Auto-registro: nombre = parte antes de @, rol viewer
    const newUserId = newId();
    const nombre = emailNorm.split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const ts = now();
    await db
      .prepare(
        `INSERT INTO users (id, email, nombre, rol, marcas, activo, created_at, updated_at)
         VALUES (?, ?, ?, 'viewer', '[]', 1, ?, ?)`
      )
      .bind(newUserId, emailNorm, nombre, ts, ts)
      .run();
    user = { id: newUserId, activo: 1 };
  }

  const token = newToken();
  const id = newId();
  const ts = now();
  await db
    .prepare('INSERT INTO auth_tokens (id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, emailNorm, token, ts + TOKEN_EXPIRY_MS, ts)
    .run();
  return token;
}

/**
 * Crea (o reactiva) una cuenta con rol especificado por el admin
 * que esta invitando y genera el primer magic-link token.
 *
 * Devuelve { token, userId, status } donde status es 'creado',
 * 'existente_actualizado' o 'rechazado' (si el user ya estaba activo
 * con un rol distinto — el admin debe cambiarlo a mano).
 */
export async function inviteUser(
  db: D1Database,
  email: string,
  nombre: string,
  rol: 'admin' | 'editor' | 'viewer',
  soloDistrict: boolean = false
): Promise<{ token: string; userId: string; status: 'creado' | 'reactivado' | 'ya_existia' } | { error: string }> {
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm || !nombre.trim()) return { error: 'Email y nombre son obligatorios.' };

  let user = await db
    .prepare('SELECT id, rol, activo FROM users WHERE email = ?')
    .bind(emailNorm)
    .first<{ id: string; rol: string; activo: number }>();

  const ts = now();
  let status: 'creado' | 'reactivado' | 'ya_existia';
  let userId: string;

  const sdFlag = soloDistrict ? 1 : 0;
  if (!user) {
    userId = newId();
    await db
      .prepare(
        `INSERT INTO users (id, email, nombre, rol, marcas, activo, solo_district, created_at, updated_at)
         VALUES (?, ?, ?, ?, '[]', 1, ?, ?, ?)`
      )
      .bind(userId, emailNorm, nombre.trim(), rol, sdFlag, ts, ts)
      .run();
    status = 'creado';
  } else if (!user.activo) {
    userId = user.id;
    await db
      .prepare('UPDATE users SET nombre = ?, rol = ?, solo_district = ?, activo = 1, updated_at = ? WHERE id = ?')
      .bind(nombre.trim(), rol, sdFlag, ts, userId)
      .run();
    status = 'reactivado';
  } else {
    userId = user.id;
    await db
      .prepare('UPDATE users SET nombre = ?, rol = ?, solo_district = ?, updated_at = ? WHERE id = ?')
      .bind(nombre.trim(), rol, sdFlag, ts, userId)
      .run();
    status = 'ya_existia';
  }

  const token = newToken();
  await db
    .prepare('INSERT INTO auth_tokens (id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(newId(), emailNorm, token, ts + INVITE_EXPIRY_MS, ts)
    .run();

  return { token, userId, status };
}

/** Verifica el token; si es válido, lo consume, crea sesión y retorna el session_id. */
export async function consumeTokenAndCreateSession(
  db: D1Database,
  token: string
): Promise<string | null> {
  const ts = now();
  const tokenRow = await db
    .prepare('SELECT id, email, expires_at, used_at FROM auth_tokens WHERE token = ?')
    .bind(token)
    .first<{ id: string; email: string; expires_at: number; used_at: number | null }>();
  if (!tokenRow) return null;
  if (tokenRow.used_at !== null) return null;
  if (tokenRow.expires_at < ts) return null;

  const user = await db
    .prepare('SELECT id, activo FROM users WHERE email = ?')
    .bind(tokenRow.email)
    .first<{ id: string; activo: number }>();
  if (!user || !user.activo) return null;

  await db.prepare('UPDATE auth_tokens SET used_at = ? WHERE id = ?').bind(ts, tokenRow.id).run();

  const sessionId = newToken();
  await db
    .prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(sessionId, user.id, ts + SESSION_EXPIRY_MS, ts)
    .run();

  // Snapshot del ultimo login (best-effort, ignora si la columna no existe).
  try {
    await db.prepare('UPDATE users SET ultimo_login = ? WHERE id = ?').bind(ts, user.id).run();
  } catch { /* ignore */ }

  return sessionId;
}

/** Lee la sesión y retorna el user, o null si no hay sesión válida. */
export async function getSessionUser(db: D1Database, sessionId: string | null): Promise<SessionUser | null> {
  if (!sessionId) return null;
  const ts = now();
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.nombre, u.rol, u.marcas, u.activo, u.solo_district, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .bind(sessionId)
    .first<UserRow & { expires_at: number; solo_district: number }>();
  if (!row) return null;
  if (row.expires_at < ts) return null;
  if (!row.activo) return null;

  let marcas: string[] = [];
  try {
    marcas = row.marcas ? JSON.parse(row.marcas) : [];
  } catch {
    marcas = [];
  }

  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    rol: row.rol,
    marcas,
    solo_district: !!row.solo_district
  };
}

/** Borra la sesión del DB (logout). */
export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
}

/** Cookie de sesión, formato production. */
export function buildSessionCookie(sessionId: string, secure: boolean = true): string {
  const parts = [
    `${SESSION_COOKIE}=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_EXPIRY_MS / 1000}`
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function buildLogoutCookie(secure: boolean = true): string {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}
