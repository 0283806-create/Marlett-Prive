# Configuración de Variables de Entorno

Para usar variables de entorno con Vite, crea un archivo `.env` en la raíz del proyecto `marlett-reservas/` con las siguientes variables:

```env
# URL de tu proyecto Supabase
VITE_SUPABASE_URL=https://lbcaivpxzkcenfyxwydw.supabase.co

# Clave anónima (anon key) de Supabase
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiY2FpdnB4emtjZW5meXh3eWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzYzOTgsImV4cCI6MjA3MzgxMjM5OH0.VmoBrs7k1XCvIQ34MycVf9hWUW8DpbPALxAjkIhcupo
```

## Dónde encontrar estos valores

1. **VITE_SUPABASE_URL**: 
   - Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
   - Settings > API > Project URL

2. **VITE_SUPABASE_ANON_KEY**:
   - Supabase Dashboard > Settings > API > Project API keys > `anon` `public`

## Nota

Si no creas el archivo `.env`, el código usará valores por defecto hardcodeados (útil para desarrollo rápido, pero no recomendado para producción).

## Para Vercel

Si despliegas en Vercel, agrega estas variables en:
- Vercel Dashboard > Tu proyecto > Settings > Environment Variables



