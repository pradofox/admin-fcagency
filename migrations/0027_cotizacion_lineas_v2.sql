ALTER TABLE lineas_cotizacion ADD COLUMN rol TEXT;
ALTER TABLE lineas_cotizacion ADD COLUMN proveedor_nombre TEXT;
-- cobro_cliente = cantidad * precio_unitario (calculado en app)
-- pago_proveedor = cobro_cliente * 0.8
-- utilidad = cobro_cliente * 0.2
