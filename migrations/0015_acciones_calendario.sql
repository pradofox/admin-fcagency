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
