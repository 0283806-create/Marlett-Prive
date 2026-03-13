import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missingEnvVars = [
  !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null
].filter(Boolean) as string[];

export const SUPABASE_CONFIG_ERROR =
  missingEnvVars.length > 0
    ? `Missing ${missingEnvVars.join(', ')}. Configure them in Vercel project settings.`
    : null;

// Keep client creation resilient in runtime; submit flow handles missing env with controlled errors.
export const SUPABASE_URL = supabaseUrl ?? 'https://invalid.supabase.co';
export const SUPABASE_ANON_KEY = supabaseAnonKey ?? 'invalid-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
