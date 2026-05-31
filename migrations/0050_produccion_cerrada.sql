-- Flag de "cerrada" para producciones. Es independiente del estado
-- (planeacion/confirmada/etc): una produccion puede estar 'completada'
-- y aun no cerrada porque falta cobrar o pagar. Cerrar = "no toquen mas,
-- ya esta saldada, todo entregado y archivada".
ALTER TABLE producciones ADD COLUMN cerrada INTEGER NOT NULL DEFAULT 0;
ALTER TABLE producciones ADD COLUMN cerrada_en INTEGER;  -- timestamp ms del cierre
CREATE INDEX IF NOT EXISTS idx_prod_cerrada ON producciones(cerrada);
