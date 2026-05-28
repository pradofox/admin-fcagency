-- KPIs de redes sociales por marca y fecha (Andrea M los registra mensualmente).

CREATE TABLE kpis_redes (
  id TEXT PRIMARY KEY,
  fecha TEXT NOT NULL,
  marca_id TEXT REFERENCES marcas(id),
  alcance INTEGER,
  engagement_pct REAL,
  seguidores_nuevos INTEGER,
  guardados INTEGER,
  dms INTEGER,
  notas TEXT,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL
);

CREATE INDEX idx_kpis_fecha_marca ON kpis_redes(fecha, marca_id);
