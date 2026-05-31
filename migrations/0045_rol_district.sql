-- Encargada District: nuevo perfil que ve lo mismo que un Project Manager
-- pero RESTRINGIDO a la seccion District Studio (+ dashboard/modelos/
-- calendario/tareas, que son utiles aunque sea district-only).
--
-- D1 no permite modificar el CHECK del rol existente, asi que en vez de
-- un valor 'district' nuevo en la columna rol, agregamos un flag
-- booleano. El user sigue siendo rol='editor' tecnicamente, pero
-- canViewSection() respeta el flag y bloquea las secciones de FC Agency.
ALTER TABLE users ADD COLUMN solo_district INTEGER NOT NULL DEFAULT 0;
