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
 * True si el user puede ver precios / cobros / pagos en general.
 * Admin y editor (PM) sí. Viewer (team) no — ve producciones, modelos,
 * etc. pero sin montos.
 */
export function canSeePrecios(user: SessionUser | null): boolean {
  return user?.rol === 'admin' || user?.rol === 'editor';
}

/** Etiqueta humana del rol (para UI). */
export function labelRol(rol: string): string {
  if (rol === 'admin')  return 'Admin';
  if (rol === 'editor') return 'Project Manager';
  if (rol === 'viewer') return 'Team';
  return rol;
}

/**
 * Visibilidad de secciones por rol. Conceptualmente:
 *   admin   = todo (incluye utilidades / margen / catalogo / pagos).
 *   editor  = Project Manager. Todo MENOS catalogo de servicios y margen.
 *   viewer  = Team. Solo modelos, producciones, redes sociales, calendario.
 *             Sin precios, sin pagos, sin cotizaciones, sin catalogo.
 *
 * Devuelve true si el rol del user puede entrar a la seccion dada.
 */
const VISIBILIDAD: Record<string, Array<'admin' | 'editor' | 'viewer'>> = {
  dashboard:    ['admin', 'editor', 'viewer'],
  modelos:      ['admin', 'editor', 'viewer'],
  producciones: ['admin', 'editor', 'viewer'],
  contenido:    ['admin', 'editor', 'viewer'],
  calendario:   ['admin', 'editor', 'viewer'],
  tareas:       ['admin', 'editor', 'viewer'],

  clientes:     ['admin', 'editor'],
  contactos:    ['admin', 'editor'],
  cotizaciones: ['admin', 'editor'],
  pagos:        ['admin', 'editor'],
  castings:     ['admin', 'editor'],
  briefs:       ['admin', 'editor'],
  district:     ['admin', 'editor'],

  proveedores:  ['admin'],   // catalogo de servicios solo admin
  admin:        ['admin'],
};

export function canViewSection(user: SessionUser | null, section: string): boolean {
  if (!user) return false;
  const roles = VISIBILIDAD[section];
  if (!roles) return true; // si la seccion no esta listada, libre
  return roles.includes(user.rol as any);
}

/** Si el user no tiene acceso a la seccion, redirige a dashboard. */
export function requireSection(context: APIContext | AstroGlobal, section: string): SessionUser {
  const user = requireUser(context);
  if (!canViewSection(user, section)) {
    throw context.redirect('/dashboard');
  }
  return user;
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
