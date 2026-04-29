-- Tabla de log de notificaciones por email enviadas vía Resend al admin de Marlett.
-- Cada fila representa un intento (exitoso o fallido) de notificar una nueva reserva.

CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservas_marlett(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  resend_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notification_log IS
  'Registro de emails de notificación enviados vía Resend al admin.';
COMMENT ON COLUMN public.notification_log.resend_id IS
  'ID que retorna Resend al enviar exitosamente.';
COMMENT ON COLUMN public.notification_log.status IS
  'sent = enviado, failed = error, pending = en proceso.';

CREATE INDEX IF NOT EXISTS idx_notification_log_created_at
  ON public.notification_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_log_status
  ON public.notification_log(status);
CREATE INDEX IF NOT EXISTS idx_notification_log_reservation
  ON public.notification_log(reservation_id);

-- RLS: solo admin puede leer el log; la Edge Function escribe vía service_role (bypass RLS).
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_log_admin_select" ON public.notification_log;

CREATE POLICY "notification_log_admin_select"
  ON public.notification_log
  FOR SELECT
  TO authenticated
  USING (public.is_marlett_admin());
