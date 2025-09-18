import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Transaction {
  id?: number
  amount: number
  type: 'income' | 'expense'
  category: string
  description?: string
  date: string
  created_at?: string
}

export interface Budget {
  id?: number
  category: string
  limit: number
  created_at?: string
}
