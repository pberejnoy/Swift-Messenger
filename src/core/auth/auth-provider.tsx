"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/src/services/supabase/client"
import { LoadingScreen } from "@/src/core/components/loading-screen"
import { useRouter, usePathname } from "next/navigation"

// Define the AuthContext type
interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Create the AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
})

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    console.warn("useAuth must be used within an AuthProvider")
    // Return default values if used outside AuthProvider
    return {
      session: null,
      user: null,
      loading: false,
      error: null,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      refreshSession: async () => {},
    }
  }
  return context
}

// Export useAuthContext as an alias for useAuth for backward compatibility
export const useAuthContext = useAuth

// Ensure user exists in the database
async function ensureUserExists(user: User) {
  if (!user) return

  try {
    console.log("Checking if user exists in database:", user.id)

    // Check if user exists in the database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking if user exists:", fetchError)
      return
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      console.log("User doesn't exist in database, creating:", user.id)

      const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
        display_name: user.user_metadata?.username || user.email?.split("@")[0] || "User",
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating user in database:", insertError)
      } else {
        console.log("Successfully created user in database:", user.id)
      }
    } else {
      console.log("User exists in database:", user.id)

      // Update last_seen_at
      try {
        await supabase.from("users").update({ last_seen_at: new Date().toISOString() }).eq("id", user.id)
      } catch (updateError) {
        console.warn("Failed to update last_seen_at:", updateError)
      }
    }
  } catch (error) {
    console.error("Error in ensureUserExists:", error)
  }
}

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the initial session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          throw sessionError
        }

        setSession(initialSession)
        setUser(initialSession?.user || null)

        // Ensure user exists in database if logged in
        if (initialSession?.user) {
          await ensureUserExists(initialSession.user)
        }

        // Set up the auth state change listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth state changed:", event)
          setSession(newSession)
          setUser(newSession?.user || null)

          // Ensure user exists in database on login
          if (event === "SIGNED_IN" && newSession?.user) {
            await ensureUserExists(newSession.user)
          }

          // Redirect based on auth state
          if (event === "SIGNED_IN") {
            // Redirect to dashboard if on login or register page
            const publicRoutes = ["/login", "/register", "/"]
            if (pathname && publicRoutes.includes(pathname)) {
              router.push("/dashboard")
            }
          } else if (event === "SIGNED_OUT") {
            // Redirect to login page
            router.push("/login")
          }
        })

        // Clean up the subscription on unmount
        return () => {
          subscription.unsubscribe()
        }
      } catch (initError) {
        console.error("Error initializing auth:", initError)
        setError(initError instanceof Error ? initError : new Error(String(initError)))
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [router, pathname])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      setSession(data.session)
      setUser(data.user)

      // Ensure user exists in database
      if (data.user) {
        await ensureUserExists(data.user)
      }

      return data
    } catch (error) {
      console.error("Error signing in:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (signUpError) throw signUpError

      setSession(data.session)
      setUser(data.user)

      // Ensure user exists in database
      if (data.user) {
        await ensureUserExists(data.user)
      }

      return data
    } catch (error) {
      console.error("Error signing up:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      setSession(null)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Refresh session function
  const refreshSession = async () => {
    try {
      setLoading(true)
      const { data, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) throw refreshError

      setSession(data.session)
      setUser(data.user)
    } catch (error) {
      console.error("Error refreshing session:", error)
      setError(error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshSession,
      }}
    >
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  )
}
