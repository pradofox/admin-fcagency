-- Extiende `modelos` con campos que usa Renata Ondarza en model-operation
-- (polas, book, videocasting, edad, sitio web, drive folder, última junta 1-a-1).

ALTER TABLE modelos ADD COLUMN edad INTEGER;
ALTER TABLE modelos ADD COLUMN polas INTEGER NOT NULL DEFAULT 0;
ALTER TABLE modelos ADD COLUMN book INTEGER NOT NULL DEFAULT 0;
ALTER TABLE modelos ADD COLUMN videocasting INTEGER NOT NULL DEFAULT 0;
ALTER TABLE modelos ADD COLUMN sitio_web TEXT;
ALTER TABLE modelos ADD COLUMN drive_folder TEXT;
ALTER TABLE modelos ADD COLUMN ultima_junta_1x1 TEXT;
