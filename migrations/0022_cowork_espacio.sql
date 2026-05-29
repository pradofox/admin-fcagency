-- Diferencia hot_desk de sala_juntas en reservas_cowork
ALTER TABLE reservas_cowork ADD COLUMN espacio TEXT DEFAULT 'hot_desk';
UPDATE reservas_cowork SET espacio = 'hot_desk' WHERE espacio IS NULL;
