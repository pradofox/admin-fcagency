CREATE TABLE marcas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  color TEXT,
  activa INTEGER NOT NULL DEFAULT 1,
  orden INTEGER NOT NULL DEFAULT 0
);

INSERT INTO marcas (id, nombre, color, orden) VALUES
  ('fc-agency', 'FC Agency', '#C9A84C', 1),
  ('district-studio', 'District Studio', '#C9A84C', 2),
  ('aleamoda', 'AleaModa', '#C9A84C', 3),
  ('voxoy', 'VOXOY', '#C9A84C', 4),
  ('fc-line', 'FC Line', '#C9A84C', 5);
