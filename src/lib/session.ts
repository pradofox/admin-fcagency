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

/** True si el user puede escribir (admin o editor). solo_district sigue
 * pudiendo editar mientras su rol sea admin o editor. */
export function canEdit(user: SessionUser | null): boolean {
  return user?.rol === 'admin' || user?.rol === 'editor';
}

/** True si el user es admin. */
export function isAdmin(user: SessionUser | null): boolean {
  return user?.rol === 'admin';
}

/**
 * True si el user puede ver precios / cobros / pagos de FC Agency.
 * Admin y editor (PM) sí. Viewer (team) no. District tampoco
 * (los precios de District los maneja en su seccion district/pagos).
 */
export function canSeePrecios(user: SessionUser | null): boolean {
  return user?.rol === 'admin' || user?.rol === 'editor';
}

/** Etiqueta humana del rol (para UI). */
export function labelRol(rol: string): string {
  if (rol === 'admin')    return 'Admin';
  if (rol === 'editor')   return 'Project Manager';
  if (rol === 'viewer')   return 'Team';
  return rol;
}

/** Etiqueta del "perfil" del user considerando el flag solo_district. */
export function labelPerfil(user: SessionUser | null): string {
  if (!user) return '—';
  if (user.solo_district) return 'Encargada District';
  return labelRol(user.rol);
}

/**
 * Visibilidad de secciones por rol.
 *   admin   = todo (incluye utilidades / margen / catalogo / pagos).
 *   editor  = Project Manager. Todo MENOS catalogo de servicios y margen.
 *   viewer  = Team. Solo modelos, producciones, redes sociales, calendario.
 *             Sin precios, sin pagos, sin cotizaciones, sin catalogo.
 *
 * Si el user tiene solo_district = true, ademas se le restringe el acceso
 * a la seccion district + auxiliares (dashboard/modelos/calendario/tareas)
 * sin importar su rol. Asi un editor con solo_district = "Encargada
 * District Studio".
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

  proveedores:  ['admin'],
  admin:        ['admin'],
};

// Si solo_district esta activo, solo estas secciones son accesibles
const SECCIONES_DISTRICT_ONLY = new Set([
  'dashboard', 'district', 'modelos', 'calendario', 'tareas'
]);

export function canViewSection(user: SessionUser | null, section: string): boolean {
  if (!user) return false;
  if (user.solo_district && !SECCIONES_DISTRICT_ONLY.has(section)) return false;
  const roles = VISIBILIDAD[section];
  if (!roles) return true;
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
