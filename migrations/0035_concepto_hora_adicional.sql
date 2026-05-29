-- Tarifa por hora adicional en conceptos (ej. modelos: 1ª hora $1000, extra $800/hr).
-- precio_mxn sigue siendo el cobro de la 1ª hora / unidad base.
ALTER TABLE conceptos_servicio ADD COLUMN precio_hora_adicional REAL;
