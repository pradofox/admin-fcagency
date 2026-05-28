-- Proveedores catalogados (fotógrafos, MUA, peinado, styling, audio, etc.).
-- Líneas de producción: cada línea es un proveedor o modelo asignado a una
-- producción, con cobro al cliente, comisión y pago neto. Replica el
-- `provs[]` de produ con el split 80/20 pero ahora configurable.

CREATE TABLE proveedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol_default TEXT,
  whatsapp TEXT,
  email TEXT,
  notas TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_proveedores_nombre ON proveedores(nombre);

CREATE TABLE lineas_produccion (
  id TEXT PRIMARY KEY,
  produccion_id TEXT NOT NULL REFERENCES producciones(id) ON DELETE CASCADE,
  proveedor_id TEXT REFERENCES proveedores(id),
  modelo_id TEXT REFERENCES modelos(id),
  nombre_libre TEXT,
  rol TEXT NOT NULL,
  cobro_cliente REAL NOT NULL DEFAULT 0,
  comision_pct REAL NOT NULL DEFAULT 20.0,
  pago_proveedor REAL GENERATED ALWAYS AS
    (ROUND(cobro_cliente * (100 - comision_pct) / 100)) VIRTUAL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK(estado IN ('pendiente','pagado','cancelado')),
  notas TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_lineas_produccion_prod ON lineas_produccion(produccion_id);
CREATE INDEX idx_lineas_produccion_proveedor ON lineas_produccion(proveedor_id);
