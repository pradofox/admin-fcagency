-- Log de auditoria: cada movimiento importante en la plataforma queda
-- registrado para que admin pueda ver quien hizo que y cuando.
-- Snapshot de email/nombre del usuario para que el log sobreviva al
-- borrado de la cuenta (no se pierde el historial).
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  user_nombre TEXT,
  accion TEXT NOT NULL,        -- create | update | delete | login | logout | rol_change | state_change
  entidad TEXT NOT NULL,       -- modelo | produccion | cotizacion | concepto | usuario | sesion | ...
  entidad_id TEXT,
  entidad_label TEXT,          -- nombre / titulo legible (snapshot)
  payload TEXT,                -- JSON con campos cambiados o metadata
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_created     ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user        ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entidad     ON audit_log(entidad, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entidad_id  ON audit_log(entidad, entidad_id);

-- Campo opcional en users para "ultimo login" (timestamp ms del ultimo
-- magic link consumido). Lo actualiza auth.ts al crear sesion.
ALTER TABLE users ADD COLUMN ultimo_login INTEGER;
