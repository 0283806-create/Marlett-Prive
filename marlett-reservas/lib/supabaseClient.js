import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase para el frontend
 * 
 * Usa variables de entorno VITE_ para configuración:
 * - VITE_SUPABASE_URL: URL de tu proyecto Supabase
 * - VITE_SUPABASE_ANON_KEY: Clave anónima (anon key) de Supabase
 * 
 * Si las variables de entorno no están definidas, usa valores por defecto
 * (útil para desarrollo local o si prefieres hardcodear temporalmente)
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lbcaivpxzkcenfyxwydw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiY2FpdnB4emtjZW5meXh3eWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzYzOTgsImV4cCI6MjA3MzgxMjM5OH0.VmoBrs7k1XCvIQ34MycVf9hWUW8DpbPALxAjkIhcupo';

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);



