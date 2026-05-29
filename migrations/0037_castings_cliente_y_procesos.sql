-- Vincular castings a un cliente registrado (antes solo era texto libre).
ALTER TABLE castings ADD COLUMN cliente_id TEXT REFERENCES clientes(id);

-- Procesos / pasos de un casting (checklist con avance).
CREATE TABLE IF NOT EXISTS casting_procesos (
  id          TEXT PRIMARY KEY,
  casting_id  TEXT NOT NULL REFERENCES castings(id) ON DELETE CASCADE,
  paso        TEXT NOT NULL,
  hecho       INTEGER NOT NULL DEFAULT 0,
  fecha       TEXT,
  nota        TEXT,
  orden       INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_casting_procesos ON casting_procesos(casting_id);
CREATE INDEX IF NOT EXISTS idx_castings_cliente ON castings(cliente_id);
