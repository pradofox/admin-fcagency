-- Número de membresía auto-asignado por miembro (DS-001, DS-002, ...)
ALTER TABLE miembros_district ADD COLUMN numero_membresia TEXT;

-- Historial de pagos de membresías
CREATE TABLE IF NOT EXISTS pagos_district (
  id TEXT PRIMARY KEY,
  miembro_id TEXT NOT NULL REFERENCES miembros_district(id),
  membresia_id TEXT REFERENCES membresias_district(id),
  monto_mxn REAL NOT NULL,
  fecha_pago TEXT NOT NULL,
  metodo TEXT DEFAULT 'efectivo',
  notas TEXT,
  registrado_por TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pagos_district_miembro ON pagos_district(miembro_id);
CREATE INDEX IF NOT EXISTS idx_pagos_district_fecha   ON pagos_district(fecha_pago);
