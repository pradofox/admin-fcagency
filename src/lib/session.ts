import type { APIContext, AstroGlobal } from 'astro';
import type { SessionUser } from '../env';

/** Lee el user de la sesión actual (lo setea el middleware). */
export function getUser(context: APIContext | AstroGlobal): SessionUser | null {
  return (context.locals as any).user ?? null;
}

/** Si no hay sesión, redirige a login. Úsalo al inicio de páginas protegidas. */
export function requireUser(context: APIContext | AstroGlobal): SessionUser {
  const user = getUser(context);
  if (!user) {
    throw context.redirect('/login');
  }
  return user;
}

/** Si el user no es admin, redirige al dashboard. */
export function requireAdmin(context: APIContext | AstroGlobal): SessionUser {
  const user = requireUser(context);
  if (user.rol !== 'admin') {
    throw context.redirect('/dashboard');
  }
  return user;
}

/** True si el user puede escribir (admin o editor). */
export function canEdit(user: SessionUser | null): boolean {
  return user?.rol === 'admin' || user?.rol === 'editor';
}

/** True si el user es admin. */
export function isAdmin(user: SessionUser | null): boolean {
  return user?.rol === 'admin';
}

/**
 * True si el user puede escribir sobre una marca específica.
 * - admin: todas las marcas.
 * - editor: solo si la marca está en su scope (editor sin scope = todas, retro-compat).
 * - viewer: nunca.
 */
export function canEditMarca(user: SessionUser | null, marcaId: string | null | undefined): boolean {
  if (!user) return false;
  if (user.rol === 'admin') return true;
  if (user.rol !== 'editor') return false;
  if (!user.marcas || user.marcas.length === 0) return true;
  if (!marcaId) return true;
  return user.marcas.includes(marcaId);
}
