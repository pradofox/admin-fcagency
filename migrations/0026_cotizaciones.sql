CREATE TABLE IF NOT EXISTS cotizaciones (
  id TEXT PRIMARY KEY,
  numero TEXT NOT NULL UNIQUE,
  cliente_id TEXT REFERENCES clientes(id),
  cliente_libre TEXT,
  titulo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'borrador',
  fecha_vencimiento TEXT,
  notas TEXT,
  notas_internas TEXT,
  produccion_id TEXT REFERENCES producciones(id),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS lineas_cotizacion (
  id TEXT PRIMARY KEY,
  cotizacion_id TEXT NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL DEFAULT 1,
  precio_unitario REAL NOT NULL DEFAULT 0,
  orden INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_lineas_cotizacion_cot ON lineas_cotizacion(cotizacion_id);
