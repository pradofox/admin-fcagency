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
