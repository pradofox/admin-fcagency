-- Planes District: precio con descuento + horas sala de juntas incluidas
ALTER TABLE planes_district ADD COLUMN precio_descuento_mxn REAL;
ALTER TABLE planes_district ADD COLUMN incluye_horas_sala_juntas INTEGER NOT NULL DEFAULT 0;
