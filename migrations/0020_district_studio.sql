-- District Studio: membresías, calendarios de estudio foto/video y cowork,
-- inventario. Schema flexible — los planes y precios los configura el equipo.

CREATE TABLE planes_district (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'cowork',
  precio_mxn REAL NOT NULL DEFAULT 0,
  duracion_dias INTEGER NOT NULL DEFAULT 30,
  descripcion TEXT,
  incluye_estudio_horas INTEGER NOT NULL DEFAULT 0,
  incluye_cowork INTEGER NOT NULL DEFAULT 0,
  incluye_club INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE miembros_district (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  empresa TEXT,
  instagram TEXT,
  notas TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE membresias_district (
  id TEXT PRIMARY KEY,
  miembro_id TEXT NOT NULL REFERENCES miembros_district(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES planes_district(id),
  fecha_inicio TEXT NOT NULL,
  fecha_proximo_pago TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activa',
  precio_pactado_mxn REAL,
  notas TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_membresias_miembro ON membresias_district(miembro_id);
CREATE INDEX idx_membresias_estado ON membresias_district(estado);
CREATE INDEX idx_membresias_pago ON membresias_district(fecha_proximo_pago);

CREATE TABLE reservas_estudio (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'foto',
  miembro_id TEXT REFERENCES miembros_district(id) ON DELETE SET NULL,
  cliente_libre TEXT,
  contacto_whatsapp TEXT,
  estado TEXT NOT NULL DEFAULT 'confirmada',
  precio_mxn REAL,
  pagado INTEGER NOT NULL DEFAULT 0,
  notas TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_reservas_estudio_fecha ON reservas_estudio(fecha);
CREATE INDEX idx_reservas_estudio_tipo ON reservas_estudio(tipo);

CREATE TABLE reservas_cowork (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  hora_inicio TEXT,
  hora_fin TEXT,
  tipo TEXT NOT NULL DEFAULT 'visita',
  titulo TEXT,
  miembro_id TEXT REFERENCES miembros_district(id) ON DELETE SET NULL,
  invitado_libre TEXT,
  capacidad INTEGER,
  notas TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_reservas_cowork_fecha ON reservas_cowork(fecha);

CREATE TABLE inventario_district (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT,
  marca TEXT,
  modelo TEXT,
  serial TEXT,
  ubicacion TEXT,
  estado TEXT NOT NULL DEFAULT 'disponible',
  cantidad_total INTEGER NOT NULL DEFAULT 1,
  cantidad_disponible INTEGER NOT NULL DEFAULT 1,
  valor_mxn REAL,
  notas TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_inventario_estado ON inventario_district(estado);
CREATE INDEX idx_inventario_categoria ON inventario_district(categoria);

CREATE TABLE movimientos_inventario (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES inventario_district(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  fecha TEXT NOT NULL,
  fecha_devolucion_esperada TEXT,
  persona TEXT,
  miembro_id TEXT REFERENCES miembros_district(id) ON DELETE SET NULL,
  produccion_id TEXT REFERENCES producciones(id) ON DELETE SET NULL,
  notas TEXT,
  registrado_por TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_movimientos_item ON movimientos_inventario(item_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha);
