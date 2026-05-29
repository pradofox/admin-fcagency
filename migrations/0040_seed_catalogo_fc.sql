-- Backup del catálogo de precios FC (hoja MATRIZ del cotizador V3).
-- IDs deterministas + INSERT OR IGNORE → re-ejecutable sin duplicar ni pisar
-- conceptos creados a mano.
INSERT OR IGNORE INTO conceptos_servicio
  (id, nombre, categoria, descripcion, precio_mxn, max_descuento, activo, created_at, updated_at)
VALUES
  ('mtz-01', 'Paquete editorial profesional', 'Producción editorial P.',
   '2 hrs sesión.
2 Horas de Estudio fotográfico District Studio.
Fotógrafo / edición (15-30 fotografías editadas)
Styling.
Producción de escenografía (Materiales no incluidos)
Dirección creativa.
Catering / lunch básico del equipo.', 26000, 15, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-02', 'Modelo editorial P. 1Hra P.', 'Producción editorial P.',
   '1 hrs de modelo editorial.', 1000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-03', 'Hra extra modelo editorial 1Hra P.', 'Producción editorial P.',
   '1 hrs extra de modelo editorial.', 800, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-04', 'Maquillaje y peinado profesional P', 'Producción editorial P.',
   '1 hrs de maquillaje y peinado por modelo
+1 hora de regalo en District Studio para maquillaje y peinado de modelos de la producción a elaborar.', 1500, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-05', 'Hora extra de estudio maquillaje en District Studio P', 'Producción editorial P.',
   '1 hora de extra en zona de maquillaje y peinado District Studio para maquillaje y/o peinado de modelos de la producción a elaborar.', 400, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-06', 'Hora extra de estudio de foto P.', 'Producción editorial P.',
   '1 hora de extra en estudio fotográfico District Studio.', 700, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-07', 'Paquete editorial estudiante E.', 'Producción editorial E.',
   '1.5 hrs sesión.
Fotógrafo / edición (15 fotos editadas y 15 sin Editar)
1.5 Horas de Estudio fotográfico District Studio.', 8500, 15, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-08', 'Modelo editorial 1Hra E.', 'Producción editorial E.',
   '1 hrs de modelo editorial.', 1000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-09', 'Hra extra modelo editorial 1Hra E.', 'Producción editorial E.',
   '1 hrs extra de modelo editorial.', 900, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-10', 'Maquillaje y peinado profesional E.', 'Producción editorial E.',
   '1 hrs de maquillaje y peinado por modelo
+1 hora de regalo en District Studio para maquillaje y peinado de modelos de la producción a elaborar.', 1500, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-11', 'Hora extra de estudio de foto en District Studio E.', 'Producción editorial E.',
   '1 hora de extra en District Studio para maquillaje y/o peinado de modelos y para uso de estudio de la producción a elaborar.', 700, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-12', 'Hora extra de estudio maquillaje en District Studio E.', 'Producción editorial E.',
   '1 hora de extra en zona de maquillaje y peinado District Studio para maquillaje y/o peinado de modelos de la producción a elaborar.', 400, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-13', 'MODEL CAMP Intensivo', 'MODEL CAMP',
   '16 horas de taller práctico y téorico de modelaje
2 fines de semana (2 sábados y 2 domingos) 4 horas por clase
Sesión fotográfica de final de cursos (10 fotos individuales)
Maquillaje y peinado para sesión de final de cursos', 4600, 25, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-14', 'MODEL CAMP Sabatino', 'MODEL CAMP',
   '16 horas de taller práctico y téorico de modelaje
8 sábados 2 horas por clase
Sesión fotográfica de final de cursos
Maquillaje y peinado para sesión de final de cursos', 4600, 25, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-15', 'MODEL CAMP Dominical', 'MODEL CAMP',
   '16 horas de taller práctico y téorico de modelaje
8 domingos 2 horas por clase
Sesión fotográfica de final de cursos (10 fotos individuales)
Maquillaje y peinado para sesión de final de cursos', 4600, 25, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-16', 'Hora renta estudio de foto District Studio', 'RENTA DISTRICT STUDIO',
   '1 Hora de Estudio fotográfico District Studio.
Uso de material de iluminación e instalaciones:
Baño / Zona de maquillaje y peinado / Infinito blanco / Cicloramas / Cocineta', 800, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-17', 'Hora extra estudio de foto District Studio', 'RENTA DISTRICT STUDIO',
   '1 Hora de Estudio fotográfico District Studio.
Uso de material de iluminación e instalaciones:
Baño / Zona de maquillaje y peinado / Infinito blanco / Cicloramas / Cocineta', 700, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-18', 'Membresía Starter', 'RENTA DISTRICT STUDIO',
   '4 Horas de Estudio fotográfico District Studio (NO CONSECUTIVAS)*
Uso de material de iluminación e instalaciones:
Baño / Zona de maquillaje y peinado / Infinito blanco / Cicloramas / Cocineta', 2400, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-19', 'Membresía Activo', 'RENTA DISTRICT STUDIO',
   '8 Horas de Estudio fotográfico District Studio (NO CONSECUTIVAS)*
Uso de material de iluminación e instalaciones:
Baño / Zona de maquillaje y peinado / Infinito blanco / Cicloramas / Cocineta', 4000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-20', 'Membresía Pro', 'RENTA DISTRICT STUDIO',
   '16 Horas de Estudio fotográfico District Studio (NO CONSECUTIVAS)*
Uso de material de iluminación e instalaciones:
Baño / Zona de maquillaje y peinado / Infinito blanco / Cicloramas / Cocineta', 7200, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-21', 'Membresía Equipo', 'RENTA DISTRICT STUDIO',
   '20 Horas de Estudio fotográfico District Studio (NO CONSECUTIVAS)*
Uso de material de iluminación e instalaciones:
Baño / Zona de maquillaje y peinado / Infinito blanco / Cicloramas / Cocineta', 8000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-22', 'Producción y gestión de pasarela de moda', 'PASARELAS',
   'Gestión de pasarela
Gestión de entradas y salidas de modelos
Dressing / coordinación de vestuario', 12000, 25, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-23', 'Maquillaje y peinado (pasarela)', 'PASARELAS',
   '1 hrs de maquillaje y peinado por modelo', 1100, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-24', 'Modelo pasarela día', 'PASARELAS',
   '1 día de fiting máximo 3 horas (prueba de vestuario)
1 día de modelo editorial.', 1400, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-25', 'Foto por modelo', 'PASARELAS',
   'Cobertura de foto y video
(  ) fotos reveladas', 400, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-26', 'Videografía del evento', 'PASARELAS',
   'video resumen de 3 minutos*', 4000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-27', '50 FOTOS EXTRAS', 'EXTRAS',
   NULL, 0, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-28', 'Catering básico por persona', 'EXTRAS',
   NULL, 200, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-29', 'Catering premium por persona', 'EXTRAS',
   NULL, 350, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-30', 'Fotógrafo', 'EXTRAS',
   NULL, 9000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000),

  ('mtz-31', 'Maquillaje y peinado (extra)', 'EXTRAS',
   NULL, 2000, NULL, 1, strftime('%s','now')*1000, strftime('%s','now')*1000);
