CREATE TABLE clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  empresa TEXT,
  notas TEXT,
  marca_id TEXT REFERENCES marcas(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE producciones (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  cliente_id TEXT REFERENCES clientes(id),
  marca_id TEXT REFERENCES marcas(id),
  fecha_inicio TEXT,
  fecha_fin TEXT,
  ubicacion TEXT,
  estado TEXT NOT NULL DEFAULT 'planeacion' CHECK(estado IN ('planeacion','confirmada','en_curso','completada','cancelada')),
  presupuesto REAL,
  notas TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  produccion_id TEXT NOT NULL REFERENCES producciones(id) ON DELETE CASCADE,
  modelo_id TEXT NOT NULL REFERENCES modelos(id),
  rol TEXT,
  tarifa REAL,
  estado TEXT NOT NULL DEFAULT 'tentativo' CHECK(estado IN ('tentativo','confirmado','cancelado')),
  notas TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_bookings_produccion ON bookings(produccion_id);
CREATE INDEX idx_bookings_modelo ON bookings(modelo_id);
