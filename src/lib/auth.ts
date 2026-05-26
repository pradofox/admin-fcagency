import { newId, newToken } from './ids';
import { now } from './db';
import type { SessionUser } from '../env';

const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 min
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

/** Genera un magic-link token para el email. Si el usuario no existe o está inactivo, retorna null. */
export async function createAuthToken(db: D1Database, email: string): Promise<string | null> {
  const emailNorm = email.trim().toLowerCase();
  const user = await db
    .prepare('SELECT id, activo FROM users WHERE email = ?')
    .bind(emailNorm)
    .first<{ id: string; activo: number }>();
  if (!user || !user.activo) return null;

  const token = newToken();
  const id = newId();
  const ts = now();
  await db
    .prepare('INSERT INTO auth_tokens (id, email, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, emailNorm, token, ts + TOKEN_EXPIRY_MS, ts)
    .run();
  return token;
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

  return sessionId;
}

/** Lee la sesión y retorna el user, o null si no hay sesión válida. */
export async function getSessionUser(db: D1Database, sessionId: string | null): Promise<SessionUser | null> {
  if (!sessionId) return null;
  const ts = now();
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.nombre, u.rol, u.marcas, u.activo, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .bind(sessionId)
    .first<UserRow & { expires_at: number }>();
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
    marcas
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
