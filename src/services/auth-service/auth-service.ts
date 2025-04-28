import { supabase } from "../supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export type AuthResponse = {
  user: User | null
  session: Session | null
  error?: Error
}

/**
 * Sign up a new user with email, password, and username
 */
export async function signUp(email: string, password: string, username: string): Promise<AuthResponse> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      throw error
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing up:", error)
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error("Unknown error during signup"),
    }
  }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
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
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error("Unknown error during signin"),
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error?: Error }> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return {}
  } catch (error) {
    console.error("Error signing out:", error)
    return { error: error instanceof Error ? error : new Error("Unknown error during signout") }
  }
}

/**
 * Get the current user session
 */
export async function getSession(): Promise<{ session: Session | null; error?: Error }> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return { session: data.session }
  } catch (error) {
    console.error("Error getting session:", error)
    return { session: null, error: error instanceof Error ? error : new Error("Unknown error getting session") }
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; error?: Error }> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    return { user: data.user }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { user: null, error: error instanceof Error ? error : new Error("Unknown error getting user") }
  }
}
