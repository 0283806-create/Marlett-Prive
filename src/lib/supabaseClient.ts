import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lbcaivpxzkcenfyxwydw.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiY2FpdnB4emtjZW5meXh3eWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzYzOTgsImV4cCI6MjA3MzgxMjM5OH0.VmoBrs7k1XCvIQ34MycVf9hWUW8DpbPALxAjkIhcupo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
