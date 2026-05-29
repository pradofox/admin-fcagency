-- Datos fiscales en pagos_district
ALTER TABLE pagos_district ADD COLUMN requiere_factura INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pagos_district ADD COLUMN factura_emitida  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pagos_district ADD COLUMN conceptos_factura TEXT; -- descripción para el XML

-- Datos fiscales en miembros_district
ALTER TABLE miembros_district ADD COLUMN rfc             TEXT;
ALTER TABLE miembros_district ADD COLUMN razon_social    TEXT;
ALTER TABLE miembros_district ADD COLUMN regimen_fiscal  TEXT;
ALTER TABLE miembros_district ADD COLUMN uso_cfdi        TEXT;
ALTER TABLE miembros_district ADD COLUMN direccion_fiscal TEXT;

-- Datos fiscales en clientes (FC Agency)
ALTER TABLE clientes ADD COLUMN rfc             TEXT;
ALTER TABLE clientes ADD COLUMN razon_social    TEXT;
ALTER TABLE clientes ADD COLUMN regimen_fiscal  TEXT;
ALTER TABLE clientes ADD COLUMN uso_cfdi        TEXT;
ALTER TABLE clientes ADD COLUMN direccion_fiscal TEXT;
