import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL. Configure it in your .env.local and Vercel project settings.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. Configure it in your .env.local and Vercel project settings.');
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
