-- Token público por modelo para exponer su agenda como feed .ics suscribible
-- en Google Calendar / Apple Calendar (sync de una vía, sin OAuth).
-- El token va en la URL: /api/ics/modelo/<token>.ics
ALTER TABLE modelos ADD COLUMN ics_token TEXT;
UPDATE modelos SET ics_token = lower(hex(randomblob(16))) WHERE ics_token IS NULL;
