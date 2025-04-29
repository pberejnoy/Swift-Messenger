import { supabase } from "../supabase/client"

/**
 * Simple sign in function that doesn't depend on database schema
 * @param email - User's email
 * @param password - User's password
 * @returns Promise with user and session data
 */
export async function simpleSignIn(email: string, password: string) {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not initialized")
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

/**
 * Simple sign out function that doesn't depend on database schema
 */
export async function simpleSignOut() {
  try {
    if (!supabase) {
      throw new Error("Supabase client is not initialized")
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}
