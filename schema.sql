-- =============================================================
-- admin-fcagency schema completo (concatenación de migrations/)
-- Para resetear y para ver el schema completo en un solo archivo.
-- No correr directamente en una DB con datos.
-- =============================================================

-- ------- 0001_users_y_sesiones.sql -------
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK(rol IN ('admin', 'editor', 'viewer')),
  marcas TEXT, -- JSON array de IDs de marcas: ["fc-agency","district-studio"]
  activo INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE auth_tokens (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_tokens_email ON auth_tokens(email);
CREATE INDEX idx_tokens_expires ON auth_tokens(expires_at);

-- ------- 0002_marcas.sql -------
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

-- ------- 0003_modelos.sql -------
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

-- ------- 0004_clientes_y_producciones.sql -------
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

-- ------- 0005_briefs_y_contenido.sql -------
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

-- ------- 0006_contactos.sql -------
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
