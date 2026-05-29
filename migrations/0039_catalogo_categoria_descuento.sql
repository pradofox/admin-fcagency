-- Sistema de cotización estilo MATRIZ del cotizador de FC.
-- Catálogo agrupado por CATEGORÍA (Producción editorial P., MODEL CAMP,
-- RENTA DISTRICT STUDIO, PASARELAS, EXTRAS) con tope de descuento por concepto.
ALTER TABLE conceptos_servicio ADD COLUMN categoria TEXT;
ALTER TABLE conceptos_servicio ADD COLUMN max_descuento REAL;

-- Línea de cotización estilo hoja: precio unitario base + cantidad + horas.
-- precio_unitario sigue guardando el SUBTOTAL de la línea (compat con totales);
-- precio_base guarda el precio unitario del concepto para mostrar y recalcular.
ALTER TABLE lineas_cotizacion ADD COLUMN precio_base REAL;

-- Descuento e IVA a nivel cotización (como el bloque de totales de la hoja).
ALTER TABLE cotizaciones ADD COLUMN descuento_pct REAL DEFAULT 0;
ALTER TABLE cotizaciones ADD COLUMN iva_pct REAL DEFAULT 16;
