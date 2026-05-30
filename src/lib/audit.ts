import type { SessionUser } from '../env';
import { newId } from './ids';

type D1 = import('@cloudflare/workers-types').D1Database;

export type AuditAccion =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'rol_change'
  | 'state_change'
  | 'convertir';

export type AuditEntidad =
  | 'modelo'
  | 'produccion'
  | 'cotizacion'
  | 'concepto'
  | 'reparto'
  | 'cliente'
  | 'contacto'
  | 'casting'
  | 'brief'
  | 'pieza'
  | 'usuario'
  | 'sesion'
  | 'pago'
  | 'accion_calendario';

export interface AuditEvent {
  user: SessionUser | null;
  accion: AuditAccion;
  entidad: AuditEntidad;
  entidad_id?: string | null;
  entidad_label?: string | null;
  payload?: Record<string, unknown> | null;
}

/**
 * Registra un evento en audit_log. Best-effort: si falla por cualquier
 * razon, NO interrumpe la operacion original (un log de auditoria caido
 * no debe tumbar un edit del usuario). Imprime warning a consola.
 *
 * Uso tipico:
 *   await logAudit(db, { user, accion: 'update', entidad: 'modelo',
 *                        entidad_id: id, entidad_label: nombre,
 *                        payload: { campos: ['nombre','email'] } });
 */
export async function logAudit(db: D1, ev: AuditEvent): Promise<void> {
  try {
    await db
      .prepare(
        `INSERT INTO audit_log
           (id, user_id, user_email, user_nombre, accion, entidad,
            entidad_id, entidad_label, payload, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        newId(),
        ev.user?.id ?? null,
        ev.user?.email ?? null,
        ev.user?.nombre ?? null,
        ev.accion,
        ev.entidad,
        ev.entidad_id ?? null,
        ev.entidad_label ?? null,
        ev.payload ? JSON.stringify(ev.payload) : null,
        Date.now()
      )
      .run();
  } catch (err) {
    // No tumbar la operacion principal por un fallo de log.
    console.warn('[audit] log fallo:', err);
  }
}
