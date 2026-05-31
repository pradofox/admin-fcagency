-- Tarifa tier para conceptos de "modelo editorial":
--   1ª hora por modelo = $1,000  (precio_mxn)
--   horas extras       = $800/hr (precio_hora_adicional)
--   por_hora = 1                 (form muestra input Horas)
--
-- El cotizador calcula subtotal = cantidad × (1000 + (horas-1) × 800)
-- cuando precio_hora_adicional > 0. Por eso basta con setear los 3
-- campos en estos conceptos.

UPDATE conceptos_servicio
SET precio_mxn = 1000,
    precio_hora_adicional = 800,
    por_hora = 1,
    updated_at = strftime('%s','now')*1000
WHERE LOWER(nombre) LIKE '%modelo editorial%'
  AND LOWER(nombre) NOT LIKE '%hra extra%'      -- evita pisar el de "hora extra" suelto
  AND LOWER(nombre) NOT LIKE '%hora extra%';
