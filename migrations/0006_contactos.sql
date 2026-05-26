CREATE TABLE contactos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('cliente','modelo','proveedor','aspirante','colaborador')),
  email TEXT,
  whatsapp TEXT,
  empresa TEXT,
  notas TEXT,
  marca_id TEXT REFERENCES marcas(id),
  paso_actual TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_contactos_tipo ON contactos(tipo);
