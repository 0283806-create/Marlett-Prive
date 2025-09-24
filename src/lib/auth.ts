import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  role?: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
}

// Auth functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const resendConfirmationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.user_metadata?.role || 'admin'
    }
  }
  return null
}

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Auth state listener
export const onAuthStateChange = (callback: (user: AuthUser | null, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email || '',
      role: session.user.user_metadata?.role || 'admin'
    } : null
    callback(user, session)
  })
}
