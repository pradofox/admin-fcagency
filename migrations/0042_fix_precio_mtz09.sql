-- Fix de precio: "Hra extra modelo editorial 1Hra E." (mtz-09) estaba en
-- $900 por typo del seed inicial; el precio real de FC es $800 (mismo que
-- mtz-03, la version Profesional). Lili lo cacho en la matriz 2026-05-29.
UPDATE conceptos_servicio SET precio_mxn = 800, updated_at = strftime('%s','now')*1000
WHERE id = 'mtz-09';
