"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/services/supabase/client"
import { routes } from "@/src/core/routing/routes"
import type { Session, User } from "@supabase/supabase-js"

type UserMetadata = {
  is_admin?: boolean
  username?: string
  [key: string]: any
}

type SessionContextType = {
  session: Session | null
  user: User | null
  isAdmin: boolean
  metadata: UserMetadata
  isLoading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isAdmin: false,
  metadata: {},
  isLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
})

/**
 * SessionProvider - Provides authentication session context to the application
 * Handles user session, metadata, and admin status
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [metadata, setMetadata] = useState<UserMetadata>({})
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to refresh session data
  const refreshSession = async () => {
    try {
      if (!supabase) {
        console.warn("Supabase client not initialized")
        return
      }

      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)

        // Extract user metadata
        const userMetadata = data.session.user.user_metadata || {}
        setMetadata(userMetadata)
        setIsAdmin(!!userMetadata.is_admin)
      } else {
        setSession(null)
        setUser(null)
        setMetadata({})
        setIsAdmin(false)
      }
    } catch (error) {
      console.error("Error refreshing session:", error)
      // Reset state on error
      setSession(null)
      setUser(null)
      setMetadata({})
      setIsAdmin(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      // Clear session state
      setSession(null)
      setUser(null)
      setMetadata({})
      setIsAdmin(false)

      // Redirect to login page
      router.push(routes.login)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        if (!supabase) {
          console.warn("Supabase client not initialized")
          setIsLoading(false)
          return
        }

        // Get initial session
        await refreshSession()
      } catch (error) {
        console.error("Error initializing session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()

    // Set up auth state change listener
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id)

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setSession(newSession)
          setUser(newSession?.user || null)

          if (newSession?.user) {
            const userMetadata = newSession.user.user_metadata || {}
            setMetadata(userMetadata)
            setIsAdmin(!!userMetadata.is_admin)
          }
        }

        if (event === "SIGNED_OUT") {
          setSession(null)
          setUser(null)
          setMetadata({})
          setIsAdmin(false)
        }

        setIsLoading(false)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }
  }, [])

  return (
    <SessionContext.Provider
      value={{
        session,
        user,
        isAdmin,
        metadata,
        isLoading,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
