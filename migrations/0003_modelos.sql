CREATE TABLE modelos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  instagram TEXT,
  cumpleanos TEXT,
  genero TEXT,
  estatura_cm INTEGER,
  busto_cm INTEGER,
  cintura_cm INTEGER,
  cadera_cm INTEGER,
  calzado_mx REAL,
  cabello TEXT,
  ojos TEXT,
  ciudad TEXT,
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo','pausa','archivado','aspirante')),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_modelos_estado ON modelos(estado);
CREATE INDEX idx_modelos_nombre ON modelos(nombre);
