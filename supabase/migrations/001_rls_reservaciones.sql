-- =============================================================================
-- RLS: solicitudes públicas (anon INSERT) y panel admin (SELECT/UPDATE/DELETE)
-- =============================================================================
-- Tabla en producción de esta app: public.reservas_marlett
-- (El nombre del archivo hace referencia a "reservaciones"; si tu tabla se llama
--  literalmente "reservaciones", sustituye reservas_marlett en este script.)
--
-- Mapeo conceptual de campos (formulario público → columnas):
--   nombre        → nombre_completo
--   email         → correo
--   telefono      → telefono_whatsapp
--   fecha         → fecha_evento
--   num_invitados → cantidad_invitados
--   tipo_evento   → tipo_evento
--   mensaje       → notes
-- Campos extra permitidos en INSERT anónimo (solo datos de la solicitud):
--   area_preferida, hora_inicio, needs_av, media_interest
-- Prohibido para anon: id (generado), created_at (default), status fuera de
-- pendiente/pending, admin_notes (solo staff).
-- =============================================================================

-- Columna opcional para notas internas del staff (no expuesta al formulario público)
ALTER TABLE public.reservas_marlett
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.reservas_marlett
  ADD COLUMN IF NOT EXISTS status text;

ALTER TABLE public.reservas_marlett
  ALTER COLUMN status SET DEFAULT 'pendiente';

-- -----------------------------------------------------------------------------
-- Función reutilizable: ¿JWT pertenece a un administrador?
-- Comprueba app_metadata.role (recomendado en Supabase) o claim top-level "role".
-- Configura admin en Dashboard: Authentication → Users → User → app_metadata: {"role":"admin"}
-- o vía SQL/service role al crear el usuario.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_marlett_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
    OR coalesce((auth.jwt() ->> 'role'), '') = 'admin';
$$;

COMMENT ON FUNCTION public.is_marlett_admin() IS
  'True si app_metadata.role es admin (recomendado; solo editable con service role) o claim JWT top-level role=admin.';

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.reservas_marlett ENABLE ROW LEVEL SECURITY;

-- Idempotencia: quitar políticas previas con los mismos nombres si re-ejecutas
DROP POLICY IF EXISTS "reservas_marlett_anon_insert" ON public.reservas_marlett;
DROP POLICY IF EXISTS "reservas_marlett_authenticated_guest_insert" ON public.reservas_marlett;
DROP POLICY IF EXISTS "reservas_marlett_admin_select" ON public.reservas_marlett;
DROP POLICY IF EXISTS "reservas_marlett_admin_update" ON public.reservas_marlett;
DROP POLICY IF EXISTS "reservas_marlett_admin_delete" ON public.reservas_marlett;

-- INSERT público (rol anon): solo visitantes sin sesión pueden crear solicitudes.
-- auth.role() = 'anon' coincide con peticiones con la anon key sin Authorization de usuario.
-- WITH CHECK limita lo que puede fijar el cliente (equivalente a no escribir columnas staff):
--   - status solo pendiente o pending (no pueden auto-confirmar).
--   - admin_notes debe quedar NULL.
CREATE POLICY "reservas_marlett_anon_insert"
  ON public.reservas_marlett
  FOR INSERT
  TO anon
  WITH CHECK (
    auth.role() = 'anon'
    AND status IN ('pending', 'pendiente')
    AND admin_notes IS NULL
  );

-- Misma regla para usuarios autenticados que NO son admin (p. ej. admin con sesión
-- abierta en otra pestaña sigue pudiendo enviar el formulario público).
CREATE POLICY "reservas_marlett_authenticated_guest_insert"
  ON public.reservas_marlett
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.role() = 'authenticated'
    AND NOT public.is_marlett_admin()
    AND status IN ('pending', 'pendiente')
    AND admin_notes IS NULL
  );

-- SELECT: solo administradores autenticados leen filas.
-- Usuarios anónimos y autenticados sin rol admin no tienen política → denegado.
CREATE POLICY "reservas_marlett_admin_select"
  ON public.reservas_marlett
  FOR SELECT
  TO authenticated
  USING (public.is_marlett_admin());

-- UPDATE: solo admin (p. ej. status → confirmada / cancelada, admin_notes).
CREATE POLICY "reservas_marlett_admin_update"
  ON public.reservas_marlett
  FOR UPDATE
  TO authenticated
  USING (public.is_marlett_admin())
  WITH CHECK (public.is_marlett_admin());

-- DELETE: solo admin.
CREATE POLICY "reservas_marlett_admin_delete"
  ON public.reservas_marlett
  FOR DELETE
  TO authenticated
  USING (public.is_marlett_admin());
