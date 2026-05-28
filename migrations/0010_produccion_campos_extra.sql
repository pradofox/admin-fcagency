-- Campos adicionales en producciones que Vic usa en produ:
-- horarios separados de inicio/fin, y dos ubicaciones (MUA y shoot).

ALTER TABLE producciones ADD COLUMN hora_inicio TEXT;
ALTER TABLE producciones ADD COLUMN hora_fin TEXT;
ALTER TABLE producciones ADD COLUMN ubicacion_mua TEXT;
ALTER TABLE producciones ADD COLUMN ubicacion_shoot TEXT;
