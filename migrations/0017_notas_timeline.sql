-- Notas con timestamp para producciones, briefs, contactos, modelos.
-- Permite al equipo dejar comentarios cronológicos en cualquier entidad.

CREATE TABLE notas (
  id TEXT PRIMARY KEY,
  entidad_tipo TEXT NOT NULL CHECK(entidad_tipo IN ('produccion', 'brief', 'contacto', 'modelo', 'casting')),
  entidad_id TEXT NOT NULL,
  texto TEXT NOT NULL,
  autor_user_id TEXT REFERENCES users(id),
  autor_nombre TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_notas_entidad ON notas(entidad_tipo, entidad_id, created_at DESC);
