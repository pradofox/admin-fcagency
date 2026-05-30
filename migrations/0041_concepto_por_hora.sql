-- El campo "Horas" del cotizador solo aplica a conceptos que se cobran por hora
-- (hora de estudio, modelo editorial, hora extra de estudio/maquillaje).
-- Para paquetes, membresías, model camp, catering, etc. Horas no debe multiplicar.
ALTER TABLE conceptos_servicio ADD COLUMN por_hora INTEGER DEFAULT 0;

-- Conceptos de la hoja MATRIZ que se cobran por hora.
UPDATE conceptos_servicio SET por_hora = 1
WHERE id IN (
  'mtz-02', -- Modelo editorial P. 1Hra
  'mtz-03', -- Hra extra modelo editorial P.
  'mtz-05', -- Hora extra estudio maquillaje District Studio P
  'mtz-06', -- Hora extra estudio de foto P.
  'mtz-08', -- Modelo editorial 1Hra E.
  'mtz-09', -- Hra extra modelo editorial E.
  'mtz-11', -- Hora extra estudio de foto District Studio E.
  'mtz-12', -- Hora extra estudio maquillaje District Studio E.
  'mtz-16', -- Hora renta estudio de foto District Studio
  'mtz-17'  -- Hora extra estudio de foto District Studio
);
