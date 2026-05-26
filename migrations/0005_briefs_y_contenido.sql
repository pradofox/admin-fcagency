CREATE TABLE briefs (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  marca_id TEXT REFERENCES marcas(id),
  pilar TEXT,
  descripcion TEXT,
  objetivo TEXT,
  formato TEXT,
  fecha_publicacion TEXT,
  plataforma TEXT,
  estado TEXT NOT NULL DEFAULT 'idea' CHECK(estado IN ('idea','aprobado','produccion','publicado','archivado')),
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE piezas_contenido (
  id TEXT PRIMARY KEY,
  brief_id TEXT REFERENCES briefs(id) ON DELETE CASCADE,
  marca_id TEXT REFERENCES marcas(id),
  titulo TEXT NOT NULL,
  formato TEXT,
  plataforma TEXT,
  fecha_programada TEXT,
  fecha_publicada TEXT,
  url_publicacion TEXT,
  estado TEXT NOT NULL DEFAULT 'programado',
  notas TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_piezas_brief ON piezas_contenido(brief_id);
CREATE INDEX idx_piezas_fecha ON piezas_contenido(fecha_programada);
