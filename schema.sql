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
-- Extiende `modelos` con campos que usa Renata Ondarza en model-operation
-- (polas, book, videocasting, edad, sitio web, drive folder, última junta 1-a-1).

ALTER TABLE modelos ADD COLUMN edad INTEGER;
ALTER TABLE modelos ADD COLUMN polas INTEGER NOT NULL DEFAULT 0;
ALTER TABLE modelos ADD COLUMN book INTEGER NOT NULL DEFAULT 0;
ALTER TABLE modelos ADD COLUMN videocasting INTEGER NOT NULL DEFAULT 0;
ALTER TABLE modelos ADD COLUMN sitio_web TEXT;
ALTER TABLE modelos ADD COLUMN drive_folder TEXT;
ALTER TABLE modelos ADD COLUMN ultima_junta_1x1 TEXT;
-- Historial de trabajos por modelo. Incluye trabajos atados a bookings del
-- sistema (booking_id) y trabajos externos / históricos (booking_id NULL).
-- Esto replica el array `trabajos[]` que Renata maneja por modelo en model-operation.

CREATE TABLE trabajos_modelo (
  id TEXT PRIMARY KEY,
  modelo_id TEXT NOT NULL REFERENCES modelos(id) ON DELETE CASCADE,
  booking_id TEXT REFERENCES bookings(id),
  tipo TEXT NOT NULL CHECK(tipo IN (
    'Editorial','Comercial','Pasarela','Video','Fitting','Evento','Casting','Otro'
  )),
  cliente TEXT,
  fecha TEXT,
  horas REAL,
  pago_mxn REAL,
  notas TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_trabajos_modelo ON trabajos_modelo(modelo_id);
CREATE INDEX idx_trabajos_fecha ON trabajos_modelo(fecha);
-- Proveedores catalogados (fotógrafos, MUA, peinado, styling, audio, etc.).
-- Líneas de producción: cada línea es un proveedor o modelo asignado a una
-- producción, con cobro al cliente, comisión y pago neto. Replica el
-- `provs[]` de produ con el split 80/20 pero ahora configurable.

CREATE TABLE proveedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol_default TEXT,
  whatsapp TEXT,
  email TEXT,
  notas TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_proveedores_nombre ON proveedores(nombre);

CREATE TABLE lineas_produccion (
  id TEXT PRIMARY KEY,
  produccion_id TEXT NOT NULL REFERENCES producciones(id) ON DELETE CASCADE,
  proveedor_id TEXT REFERENCES proveedores(id),
  modelo_id TEXT REFERENCES modelos(id),
  nombre_libre TEXT,
  rol TEXT NOT NULL,
  cobro_cliente REAL NOT NULL DEFAULT 0,
  comision_pct REAL NOT NULL DEFAULT 20.0,
  pago_proveedor REAL GENERATED ALWAYS AS
    (ROUND(cobro_cliente * (100 - comision_pct) / 100)) VIRTUAL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK(estado IN ('pendiente','pagado','cancelado')),
  notas TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_lineas_produccion_prod ON lineas_produccion(produccion_id);
CREATE INDEX idx_lineas_produccion_proveedor ON lineas_produccion(proveedor_id);
-- Campos adicionales en producciones que Vic usa en produ:
-- horarios separados de inicio/fin, y dos ubicaciones (MUA y shoot).

ALTER TABLE producciones ADD COLUMN hora_inicio TEXT;
ALTER TABLE producciones ADD COLUMN hora_fin TEXT;
ALTER TABLE producciones ADD COLUMN ubicacion_mua TEXT;
ALTER TABLE producciones ADD COLUMN ubicacion_shoot TEXT;
-- Campos completos que Andrea M usa en brand-content para briefs y piezas.
-- Brief: la parte editorial (qué publicar, cómo, para quién).
-- Pieza: pilar de comunicación.

ALTER TABLE briefs ADD COLUMN audiencia TEXT;
ALTER TABLE briefs ADD COLUMN cta TEXT;
ALTER TABLE briefs ADD COLUMN copy TEXT;
ALTER TABLE briefs ADD COLUMN hashtags TEXT;
ALTER TABLE briefs ADD COLUMN musica TEXT;
ALTER TABLE briefs ADD COLUMN refs_visuales TEXT;
ALTER TABLE briefs ADD COLUMN creador_asignado TEXT;
ALTER TABLE briefs ADD COLUMN deadline TEXT;

-- piezas_contenido: pilar de comunicación. D1/SQLite no acepta ALTER ... ADD
-- CHECK; el catálogo de valores se documenta y se valida en la app.
-- Valores válidos: 'Inspiración','Educación','Comunidad','Posicionamiento','Conversión'.
ALTER TABLE piezas_contenido ADD COLUMN pilar TEXT;
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
-- KPIs de redes sociales por marca y fecha (Andrea M los registra mensualmente).

CREATE TABLE kpis_redes (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  marca_id TEXT REFERENCES marcas(id),
  alcance INTEGER,
  engagement_pct REAL,
  seguidores_nuevos INTEGER,
  guardados INTEGER,
  dms INTEGER,
  notas TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_kpis_fecha_marca ON kpis_redes(fecha, marca_id);
-- CRM completo: Victoria usa community como tracker de contactos con flujo
-- de pasos por tipo, estatus de embudo y semáforos de pago/material/retro.

ALTER TABLE contactos ADD COLUMN canal TEXT;
-- canal: 'Instagram','WhatsApp','Correo','Referido' (validar en app)

ALTER TABLE contactos ADD COLUMN estatus_crm TEXT NOT NULL DEFAULT 'nuevo_contacto';
-- estatus_crm: 'nuevo_contacto','cotizacion_enviada','en_negociacion','confirmado',
--              'en_produccion','post_produccion','pago_pendiente','retro_pendiente',
--              'material_pendiente','cerrado' (validar en app)

ALTER TABLE contactos ADD COLUMN produccion_id TEXT REFERENCES producciones(id);
ALTER TABLE contactos ADD COLUMN pago_cliente_estado TEXT DEFAULT 'pendiente';
-- pago_cliente_estado: 'pendiente','anticipo_recibido','pagado','no_aplica'

ALTER TABLE contactos ADD COLUMN pago_modelo_estado TEXT DEFAULT 'por_pagar';
-- pago_modelo_estado: 'por_pagar','pagado','no_aplica'

ALTER TABLE contactos ADD COLUMN material_recibido INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contactos ADD COLUMN retro_enviada INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contactos ADD COLUMN next_action_date TEXT;
ALTER TABLE contactos ADD COLUMN next_action_text TEXT;

-- Pasos por contacto: progresión del flujo del CRM. Cada tipo (cliente, modelo,
-- proveedor, aspirante) tiene un catálogo distinto de pasos.
CREATE TABLE contacto_pasos (
  id TEXT PRIMARY KEY,
  contacto_id TEXT NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  paso_idx INTEGER NOT NULL,
  paso_texto TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER
);
CREATE UNIQUE INDEX idx_contacto_paso ON contacto_pasos(contacto_id, paso_idx);
CREATE INDEX idx_contacto_pasos_contacto ON contacto_pasos(contacto_id);
-- Acciones / tareas con fecha (Victoria usa esto en community como calendario).
-- Atadas opcionalmente a un contacto o producción.

CREATE TABLE acciones_calendario (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  tarea TEXT NOT NULL,
  contacto_id TEXT REFERENCES contactos(id) ON DELETE SET NULL,
  produccion_id TEXT REFERENCES producciones(id) ON DELETE SET NULL,
  prioridad TEXT NOT NULL DEFAULT 'Media'
    CHECK(prioridad IN ('Alta','Media','Baja')),
  done INTEGER NOT NULL DEFAULT 0,
  asignado_a TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_acciones_fecha ON acciones_calendario(fecha);
CREATE INDEX idx_acciones_done ON acciones_calendario(done);
-- Castings (Renata Ondarza los maneja en model-operation).
-- Una sesión de casting puede tener múltiples modelos propuestas y una seleccionada.

CREATE TABLE castings (
  id TEXT PRIMARY KEY,
  cliente TEXT NOT NULL,
  marca_id TEXT REFERENCES marcas(id),
  tipo TEXT CHECK(tipo IN (
    'Editorial','Comercial','Pasarela','Video','Fitting','Evento','Otro'
  )),
  fecha TEXT,
  hora TEXT,
  lugar TEXT,
  perfil TEXT,
  pago_modelo REAL,
  etapa TEXT NOT NULL DEFAULT 'Abierto'
    CHECK(etapa IN ('Abierto','Selección','Confirmado','Realizado','Cancelado')),
  modelo_seleccionado_id TEXT REFERENCES modelos(id),
  notas TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_castings_etapa ON castings(etapa);
CREATE INDEX idx_castings_fecha ON castings(fecha);

CREATE TABLE casting_modelos_propuestos (
  casting_id TEXT NOT NULL REFERENCES castings(id) ON DELETE CASCADE,
  modelo_id TEXT NOT NULL REFERENCES modelos(id),
  PRIMARY KEY (casting_id, modelo_id)
);
