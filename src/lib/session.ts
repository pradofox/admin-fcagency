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
