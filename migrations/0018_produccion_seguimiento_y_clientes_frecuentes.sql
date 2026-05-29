-- Fase A: ajustes pedidos por el equipo FC (PDF de sugerencias mayo 2026).
-- Producciones: campos de seguimiento (próximo paso, fecha próxima acción,
-- material pendiente, retro, pagos cliente/modelo, equipo, links, tipo).
-- Clientes: marcar frecuentes.

ALTER TABLE producciones ADD COLUMN proximo_paso TEXT;
ALTER TABLE producciones ADD COLUMN fecha_proxima_accion TEXT;
ALTER TABLE producciones ADD COLUMN material_pendiente TEXT;
ALTER TABLE producciones ADD COLUMN retro_enviada INTEGER NOT NULL DEFAULT 0;
ALTER TABLE producciones ADD COLUMN material_recibido INTEGER NOT NULL DEFAULT 0;
ALTER TABLE producciones ADD COLUMN pago_cliente_estado TEXT DEFAULT 'pendiente';
ALTER TABLE producciones ADD COLUMN pago_modelo_estado TEXT DEFAULT 'por_pagar';
ALTER TABLE producciones ADD COLUMN equipo_involucrado TEXT;
ALTER TABLE producciones ADD COLUMN links_referencias TEXT;
ALTER TABLE producciones ADD COLUMN tipo_produccion TEXT;

CREATE INDEX idx_producciones_fecha_proxima ON producciones(fecha_proxima_accion);
CREATE INDEX idx_producciones_tipo ON producciones(tipo_produccion);

ALTER TABLE clientes ADD COLUMN es_frecuente INTEGER NOT NULL DEFAULT 0;
CREATE INDEX idx_clientes_frecuente ON clientes(es_frecuente);
