import { defineMiddleware } from 'astro:middleware';
import { getSessionUser, SESSION_COOKIE } from './lib/auth';

const PUBLIC_PATHS = ['/login', '/login-enviado', '/auth/verify', '/api/auth/login', '/favicon.svg', '/api/ics'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const runtime = (context.locals as any).runtime;
  const db = runtime?.env?.DB as D1Database | undefined;

  // Carga del user si hay sesión
  if (db) {
    const sessionId = context.cookies.get(SESSION_COOKIE)?.value ?? null;
    const user = await getSessionUser(db, sessionId);
    (context.locals as any).user = user;
  } else {
    (context.locals as any).user = null;
  }

  // Rutas públicas pasan sin auth
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return next();

  // Si no hay user y la ruta no es pública, redirige
  const user = (context.locals as any).user;
  if (!user) {
    return context.redirect('/login');
  }

  return next();
});
