-- Historial de trabajos por modelo. Incluye trabajos atados a bookings del
-- sistema (booking_id) y trabajos externos / históricos (booking_id NULL).
-- Esto replica el array `trabajos[]` que Renata maneja por modelo en model-operation.

CREATE TABLE trabajos_modelo (
  id TEXT PRIMARY KEY,
  modelo_id TEXT NOT NULL REFERENCES modelos(id) ON DELETE CASCADE,
  booking_id TEXT REFERENCES bookings(id),
  tipo TEXT NOT NULL CHECK(tipo IN (
    'Editorial','Comercial','Pasarela','Video','Fitting','Evento','Casting','Otro'
  )),
  cliente TEXT,
  fecha TEXT,
  horas REAL,
  pago_mxn REAL,
  notas TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_trabajos_modelo ON trabajos_modelo(modelo_id);
CREATE INDEX idx_trabajos_fecha ON trabajos_modelo(fecha);
