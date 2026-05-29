-- Líneas de cotización ligadas a conceptos del catálogo de servicios.
-- Cuando una línea viene de un concepto, su reparto a proveedores es el real
-- (suma de repartos_concepto), no el 80/20 fijo. Guardamos un snapshot para
-- que la cotización no cambie si después editan el concepto del catálogo.

ALTER TABLE lineas_cotizacion ADD COLUMN concepto_id TEXT;        -- referencia al concepto del catálogo (NULL = línea manual)
ALTER TABLE lineas_cotizacion ADD COLUMN pago_proveedor REAL;     -- pago real a proveedores (NULL = usar 80/20 fijo)
ALTER TABLE lineas_cotizacion ADD COLUMN reparto_json TEXT;       -- snapshot del reparto [{proveedor_nombre, rol, monto_mxn}, ...]
