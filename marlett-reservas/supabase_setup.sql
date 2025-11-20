-- ============================================
-- Script de migración y creación para la tabla `reservas_marlett`
-- ============================================
-- Este script crea o actualiza la estructura de la tabla `reservas_marlett`
-- para que contenga los campos avanzados usados por la landing de Marlett.
-- También agrega índices, restricciones y una vista para exportar a Excel.
-- ============================================
-- Instrucciones:
-- 1. Abre el SQL Editor de tu proyecto en Supabase.
-- 2. Pega este script completo.
-- 3. Ejecuta el script (Run).
-- ============================================

-- Extensión requerida para uuid_generate_v4() (solo si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear enum de estado si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'reservation_status'
  ) THEN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled');
  END IF;
END
$$;

-- Crear tabla si no existe con la nueva estructura
CREATE TABLE IF NOT EXISTS reservas_marlett (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nombre_completo TEXT NOT NULL,
  telefono_whatsapp TEXT NOT NULL,
  correo TEXT,
  area_preferida TEXT,
  tipo_evento TEXT NOT NULL,
  fecha_evento DATE NOT NULL,
  hora_inicio TIME,
  cantidad_invitados INTEGER NOT NULL CHECK (cantidad_invitados BETWEEN 1 AND 1000),
  needs_av TEXT,
  av_items TEXT[],
  av_notes TEXT,
  media_interest TEXT,
  media_notes TEXT,
  notes TEXT,
  status reservation_status NOT NULL DEFAULT 'pending'
);

-- Renombrar columnas antiguas para preservar datos existentes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservas_marlett' AND column_name = 'usa_visuales'
  ) THEN
    EXECUTE 'ALTER TABLE reservas_marlett RENAME COLUMN usa_visuales TO needs_av';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservas_marlett' AND column_name = 'paquetes_foto_video'
  ) THEN
    EXECUTE 'ALTER TABLE reservas_marlett RENAME COLUMN paquetes_foto_video TO media_interest';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reservas_marlett' AND column_name = 'notas_adicionales'
  ) THEN
    EXECUTE 'ALTER TABLE reservas_marlett RENAME COLUMN notas_adicionales TO notes';
  END IF;
END
$$;

-- Convertir hora_inicio a TIME (si la columna existía como texto)
ALTER TABLE IF EXISTS reservas_marlett
  ALTER COLUMN hora_inicio TYPE TIME USING NULLIF(hora_inicio::text, '')::time;

-- Asegurar columnas avanzadas
ALTER TABLE reservas_marlett
  ADD COLUMN IF NOT EXISTS av_items TEXT[],
  ADD COLUMN IF NOT EXISTS av_notes TEXT,
  ADD COLUMN IF NOT EXISTS media_notes TEXT,
  ADD COLUMN IF NOT EXISTS status reservation_status DEFAULT 'pending';

-- Asegurar que columnas obligatorias sean NOT NULL
UPDATE reservas_marlett SET cantidad_invitados = 1 WHERE cantidad_invitados IS NULL;
ALTER TABLE reservas_marlett
  ALTER COLUMN nombre_completo SET NOT NULL,
  ALTER COLUMN telefono_whatsapp SET NOT NULL,
  ALTER COLUMN tipo_evento SET NOT NULL,
  ALTER COLUMN fecha_evento SET NOT NULL,
  ALTER COLUMN cantidad_invitados SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Reemplazar constraint de rango de invitados
ALTER TABLE reservas_marlett DROP CONSTRAINT IF EXISTS reservas_marlett_cantidad_invitados_check;
ALTER TABLE reservas_marlett
  ADD CONSTRAINT reservas_marlett_cantidad_invitados_check CHECK (cantidad_invitados BETWEEN 1 AND 1000);

-- Asegurar valores por defecto en estado
UPDATE reservas_marlett SET status = 'pending' WHERE status IS NULL;

-- Índices útiles para reportes
CREATE INDEX IF NOT EXISTS idx_reservas_marlett_created_at ON reservas_marlett(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservas_marlett_fecha_evento ON reservas_marlett(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_reservas_marlett_telefono ON reservas_marlett(telefono_whatsapp);
CREATE INDEX IF NOT EXISTS idx_reservas_marlett_status ON reservas_marlett(status);

-- Habilitar RLS (opcional pero recomendado)
ALTER TABLE reservas_marlett ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS
DROP POLICY IF EXISTS "Permitir insertar reservas desde cliente anónimo" ON reservas_marlett;
DROP POLICY IF EXISTS "Permitir leer reservas desde cliente anónimo" ON reservas_marlett;

CREATE POLICY "Permitir insertar reservas desde cliente anónimo"
  ON reservas_marlett
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Permitir leer reservas desde cliente anónimo"
  ON reservas_marlett
  FOR SELECT
  TO anon
  USING (true);

-- Vista optimizada para exportar a Excel / CSV
CREATE OR REPLACE VIEW reservas_marlett_export AS
SELECT
  r.id,
  r.created_at,
  r.nombre_completo,
  r.telefono_whatsapp,
  r.correo,
  r.area_preferida,
  r.tipo_evento,
  r.fecha_evento,
  r.hora_inicio,
  r.cantidad_invitados,
  r.needs_av,
  array_to_string(r.av_items, ', ') AS av_items,
  r.av_notes,
  r.media_interest,
  r.media_notes,
  r.notes,
  r.status
FROM reservas_marlett r
ORDER BY r.created_at DESC;

-- Comentarios descriptivos
COMMENT ON TABLE reservas_marlett IS 'Reservaciones para eventos Marlett (sitio web)';
COMMENT ON COLUMN reservas_marlett.needs_av IS 'Respuesta sobre necesidades audiovisuales';
COMMENT ON COLUMN reservas_marlett.av_items IS 'Lista de componentes audiovisuales requeridos';
COMMENT ON COLUMN reservas_marlett.media_interest IS 'Interés en servicios de foto/video';
COMMENT ON COLUMN reservas_marlett.notes IS 'Notas adicionales proporcionadas por el cliente';
COMMENT ON COLUMN reservas_marlett.status IS 'Estado del flujo de la reservación';

-- ============================================
-- Verificaciones sugeridas tras ejecutar:
--   SELECT * FROM reservas_marlett LIMIT 5;
--   SELECT * FROM reservas_marlett_export LIMIT 5;
-- ============================================

