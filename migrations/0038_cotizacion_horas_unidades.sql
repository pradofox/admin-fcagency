-- Cotización de modelos por hora Y por unidad (número de modelos).
-- Una línea de modelo puede cubrir varios modelos a la misma tarifa:
--   cobro_linea = unidades * (1ª hora + (horas - 1) * hora_adicional)
-- Ej: 5 modelos × 4 hrs = 5 primeras horas $1,000 + 15 horas $800.
-- precio_unitario sigue guardando el COBRO TOTAL de la línea (compat con totales).
ALTER TABLE lineas_cotizacion ADD COLUMN horas REAL;
ALTER TABLE lineas_cotizacion ADD COLUMN unidades REAL;
