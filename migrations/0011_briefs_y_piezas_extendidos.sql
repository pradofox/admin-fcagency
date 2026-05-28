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
