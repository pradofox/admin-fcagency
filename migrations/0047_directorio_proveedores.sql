-- Directorio de proveedores reales (personas/empresas) clasificados por tipo.
-- Es complementario al catalogo de servicios (conceptos_servicio): aqui se
-- da de alta a la gente; alla se arman los paquetes que se cobran al cliente.
-- A futuro se puede vincular repartos_concepto.proveedor_id a esta tabla.
CREATE TABLE IF NOT EXISTS proveedores_directorio (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT,                    -- fotografo, video, modelo, maquillaje, peinado, styling, produccion, catering, locacion, transporte, otro
  email TEXT,
  whatsapp TEXT,
  instagram TEXT,
  empresa TEXT,
  rfc TEXT,
  tarifa_base REAL,             -- tarifa "de salida" (por hora, dia, servicio); referencia, no obligatorio
  tarifa_unidad TEXT,           -- 'hora' | 'dia' | 'servicio'
  ciudad TEXT,
  notas TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prov_dir_tipo   ON proveedores_directorio(tipo);
CREATE INDEX IF NOT EXISTS idx_prov_dir_nombre ON proveedores_directorio(nombre);
CREATE INDEX IF NOT EXISTS idx_prov_dir_activo ON proveedores_directorio(activo);
