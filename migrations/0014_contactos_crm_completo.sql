-- CRM completo: Victoria usa community como tracker de contactos con flujo
-- de pasos por tipo, estatus de embudo y semáforos de pago/material/retro.

ALTER TABLE contactos ADD COLUMN canal TEXT;
-- canal: 'Instagram','WhatsApp','Correo','Referido' (validar en app)

ALTER TABLE contactos ADD COLUMN estatus_crm TEXT NOT NULL DEFAULT 'nuevo_contacto';
-- estatus_crm: 'nuevo_contacto','cotizacion_enviada','en_negociacion','confirmado',
--              'en_produccion','post_produccion','pago_pendiente','retro_pendiente',
--              'material_pendiente','cerrado' (validar en app)

ALTER TABLE contactos ADD COLUMN produccion_id TEXT REFERENCES producciones(id);
ALTER TABLE contactos ADD COLUMN pago_cliente_estado TEXT DEFAULT 'pendiente';
-- pago_cliente_estado: 'pendiente','anticipo_recibido','pagado','no_aplica'

ALTER TABLE contactos ADD COLUMN pago_modelo_estado TEXT DEFAULT 'por_pagar';
-- pago_modelo_estado: 'por_pagar','pagado','no_aplica'

ALTER TABLE contactos ADD COLUMN material_recibido INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contactos ADD COLUMN retro_enviada INTEGER NOT NULL DEFAULT 0;
ALTER TABLE contactos ADD COLUMN next_action_date TEXT;
ALTER TABLE contactos ADD COLUMN next_action_text TEXT;

-- Pasos por contacto: progresión del flujo del CRM. Cada tipo (cliente, modelo,
-- proveedor, aspirante) tiene un catálogo distinto de pasos.
CREATE TABLE contacto_pasos (
  id TEXT PRIMARY KEY,
  contacto_id TEXT NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
  paso_idx INTEGER NOT NULL,
  paso_texto TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER
);
CREATE UNIQUE INDEX idx_contacto_paso ON contacto_pasos(contacto_id, paso_idx);
CREATE INDEX idx_contacto_pasos_contacto ON contacto_pasos(contacto_id);
