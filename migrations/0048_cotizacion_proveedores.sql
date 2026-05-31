-- Equipo de produccion propuesto en una cotizacion (proveedores del
-- directorio). Al convertir la cotizacion en produccion, estos se vuelven
-- lineas con su rol.
CREATE TABLE IF NOT EXISTS cotizacion_proveedores (
  id TEXT PRIMARY KEY,
  cotizacion_id TEXT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  proveedor_dir_id TEXT NOT NULL REFERENCES proveedores_directorio(id),
  rol TEXT,
  notas TEXT,
  created_at INTEGER NOT NULL,
  UNIQUE(cotizacion_id, proveedor_dir_id)
);
CREATE INDEX IF NOT EXISTS idx_cot_prov_cot ON cotizacion_proveedores(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cot_prov_prov ON cotizacion_proveedores(proveedor_dir_id);
