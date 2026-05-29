-- Hora de llamado por persona/modelo en la línea de producción.
ALTER TABLE lineas_produccion ADD COLUMN hora_llamado TEXT;

-- Registro de avisos/recordatorios enviados (para historial y evitar duplicados).
CREATE TABLE IF NOT EXISTS notificaciones (
  id                  TEXT PRIMARY KEY,
  produccion_id       TEXT NOT NULL REFERENCES producciones(id) ON DELETE CASCADE,
  tipo                TEXT NOT NULL,            -- 'convocatoria' | 'recordatorio'
  destinatario_tipo   TEXT NOT NULL,            -- 'modelo' | 'cliente' | 'proveedor'
  destinatario_nombre TEXT,
  email               TEXT NOT NULL,
  estado              TEXT NOT NULL DEFAULT 'enviado',  -- 'enviado' | 'error'
  detalle             TEXT,
  enviado_en          INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notif_prod ON notificaciones(produccion_id);
