/**
 * Supabase Client — Used only for Google OAuth on the frontend.
 * All other database operations go through our FastAPI backend.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set — Google login will not work')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // We handle OAuth hash tokens ourselves in AuthContext.
      // Disable Supabase's auto-detection to prevent race conditions.
      detectSessionInUrl: false,
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

