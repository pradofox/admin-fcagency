-- Vincula una tarea con la linea_produccion que la genero. Cuando esa
-- linea pasa a estado 'pagado' (en /pagos o en /producciones), la tarea
-- se marca como completada automaticamente. Tambien al revertir.
ALTER TABLE acciones_calendario ADD COLUMN linea_produccion_id TEXT;
CREATE INDEX IF NOT EXISTS idx_acciones_linea_prod ON acciones_calendario(linea_produccion_id);
