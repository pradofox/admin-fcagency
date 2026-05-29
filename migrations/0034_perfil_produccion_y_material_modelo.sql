-- Task 3: archivos/entregables de la producción (separado de links de referencia/inspo)
ALTER TABLE producciones ADD COLUMN archivos_referencias TEXT;

-- Task 4: seguimiento de material del book del modelo.
-- Se reutilizan las columnas existentes polas / book / videocasting (booleanos
-- 0/1 = existe o no) y drive_folder (URL del material). Se agregan:
ALTER TABLE modelos ADD COLUMN material_actualizado_en TEXT; -- fecha (YYYY-MM-DD) de última actualización de material
ALTER TABLE modelos ADD COLUMN material_notas TEXT;          -- qué falta / pendiente de material
