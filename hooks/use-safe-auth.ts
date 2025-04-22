"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

type User = {
  id: string
  email: string
  displayName?: string
  avatar?: string
  isAdmin?: boolean
  isOnline?: boolean
}

type SafeAuthResult = {
  currentUser: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAuthAvailable: boolean
}

export function useSafeAuth(): SafeAuthResult {
  const [localUser, setLocalUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthAvailable, setIsAuthAvailable] = useState(true)

  const authContext = useAuth()

  useEffect(() => {
    setIsAuthAvailable(!!authContext)
  }, [authContext])

  useEffect(() => {
    if (!isAuthAvailable) {
      // Try to get user from localStorage
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        try {
          setLocalUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem("currentUser")
        }
      }
      setIsLoading(false)
    }
  }, [isAuthAvailable])

  return {
    currentUser: authContext?.currentUser || localUser,
    isLoading: authContext?.isLoading || isLoading,
    isAuthenticated: !!(authContext?.currentUser || localUser),
    isAuthAvailable,
  }
}
