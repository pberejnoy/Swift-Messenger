import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/src/lib/types/database.types"

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Log warning if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Authentication features will not work properly.")
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
