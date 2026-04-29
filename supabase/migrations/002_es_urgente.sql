-- Marca booleana para reservaciones cuya fecha de evento cae a menos de 30 días.
-- El frontend setea este flag cuando el cliente elige una fecha específica (no flexible)
-- y la fecha está dentro de la ventana de urgencia. Permite priorizar el listado en el
-- panel admin sin recalcular la urgencia desde la fecha en cada render.

ALTER TABLE public.reservas_marlett
  ADD COLUMN IF NOT EXISTS es_urgente BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.reservas_marlett.es_urgente IS
  'TRUE cuando la reservación se envió con fecha específica a menos de 30 días.';
