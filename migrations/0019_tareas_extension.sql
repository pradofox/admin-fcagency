-- Fase B: convertir acciones_calendario en un sistema de tareas asignables.
-- Lili (FC) pidió: PM asigna tareas a usuarios, cada user ve sus pendientes
-- en su dashboard con urgencia y fecha de entrega, y puede cambiar el estado.
-- La tabla ya tenía asignado_a y prioridad. Le faltaba estado rico, descripción,
-- quién la asignó y timestamp de completado.

ALTER TABLE acciones_calendario ADD COLUMN descripcion TEXT;
ALTER TABLE acciones_calendario ADD COLUMN asignado_por TEXT REFERENCES users(id);
ALTER TABLE acciones_calendario ADD COLUMN completed_at INTEGER;
ALTER TABLE acciones_calendario ADD COLUMN estado TEXT NOT NULL DEFAULT 'pendiente';
ALTER TABLE acciones_calendario ADD COLUMN updated_at INTEGER;

UPDATE acciones_calendario SET estado = 'completada', completed_at = created_at WHERE done = 1;

CREATE INDEX idx_acciones_asignado ON acciones_calendario(asignado_a);
CREATE INDEX idx_acciones_estado ON acciones_calendario(estado);
CREATE INDEX idx_acciones_produccion ON acciones_calendario(produccion_id);
