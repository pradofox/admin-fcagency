-- Catálogo de servicios: conceptos con reparto interno a proveedores
CREATE TABLE IF NOT EXISTS conceptos_servicio (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  rol         TEXT,             -- Fotografía, Video, Modelo, etc.
  descripcion TEXT,
  precio_mxn  REAL NOT NULL DEFAULT 0,   -- cobro total al cliente
  notas       TEXT,
  activo      INTEGER DEFAULT 1,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

-- Reparto: cuánto le toca a cada proveedor del total del concepto
CREATE TABLE IF NOT EXISTS repartos_concepto (
  id               TEXT PRIMARY KEY,
  concepto_id      TEXT NOT NULL REFERENCES conceptos_servicio(id) ON DELETE CASCADE,
  proveedor_nombre TEXT NOT NULL,
  rol              TEXT,
  monto_mxn        REAL NOT NULL DEFAULT 0,
  notas            TEXT
);
