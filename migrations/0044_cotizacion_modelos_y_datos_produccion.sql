-- Modelos propuestos en una cotizacion. Cuando la cotizacion se convierte
-- en produccion, estos modelos pasan como bookings tentativos.
CREATE TABLE IF NOT EXISTS cotizacion_modelos (
  id TEXT PRIMARY KEY,
  cotizacion_id TEXT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  modelo_id TEXT NOT NULL REFERENCES modelos(id),
  rol TEXT,
  notas TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(cotizacion_id, modelo_id)
);
CREATE INDEX IF NOT EXISTS idx_cm_cotizacion ON cotizacion_modelos(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cm_modelo     ON cotizacion_modelos(modelo_id);

-- Datos de evento en la cotizacion. Se piden al convertir a produccion
-- (o si la cotizacion ya los tiene, se usan tal cual sin volver a pedir).
-- Para tipos editorial/pasarela la fecha es obligatoria al convertir.
ALTER TABLE cotizaciones ADD COLUMN tipo TEXT;          -- editorial | pasarela | campaña | otro
ALTER TABLE cotizaciones ADD COLUMN fecha_evento TEXT;  -- YYYY-MM-DD
ALTER TABLE cotizaciones ADD COLUMN hora_evento TEXT;   -- HH:MM
ALTER TABLE cotizaciones ADD COLUMN ubicacion TEXT;
