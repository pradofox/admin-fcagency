-- Campañas de marca (Andrea M las maneja en brand-content).
-- Una campaña puede agrupar varias piezas de contenido.

CREATE TABLE campanas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  marca_id TEXT REFERENCES marcas(id),
  tipo TEXT,
  fecha_inicio TEXT,
  fecha_fin TEXT,
  objetivo TEXT,
  estado TEXT NOT NULL DEFAULT 'Activa'
    CHECK(estado IN ('Activa','Pausada','Completada','Cancelada')),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_campanas_marca ON campanas(marca_id);
CREATE INDEX idx_campanas_estado ON campanas(estado);
