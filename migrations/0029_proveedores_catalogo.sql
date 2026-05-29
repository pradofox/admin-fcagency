-- Catálogo de proveedores con tarifas por servicio
CREATE TABLE IF NOT EXISTS proveedores_catalogo (
  id         TEXT PRIMARY KEY,
  nombre     TEXT NOT NULL,
  tipo       TEXT,        -- fotografo, videoasta, modelo, maquillaje, peinado, styling, etc.
  telefono   TEXT,
  instagram  TEXT,
  email      TEXT,
  notas      TEXT,
  activo     INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tarifas_proveedor (
  id           TEXT PRIMARY KEY,
  proveedor_id TEXT NOT NULL REFERENCES proveedores_catalogo(id) ON DELETE CASCADE,
  rol          TEXT NOT NULL,        -- Fotografía, Video, Modelo, etc.
  descripcion  TEXT NOT NULL,        -- Ej. "Sesión editorial 4 hrs"
  precio_mxn   REAL NOT NULL DEFAULT 0,
  notas        TEXT
);
