"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

type User = {
  id: string
  name?: string
  email?: string
  role?: string
}

type SessionContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  checkSession: () => Promise<boolean>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  checkSession: async () => false,
  logout: async () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const checkSession = async (): Promise<boolean> => {
    try {
      console.log("Checking session...")
      const response = await fetch("/api/auth/session", {
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        console.log("Session check failed:", response.status, response.statusText)
        setUser(null)
        setIsLoading(false)
        return false
      }

      const data = await response.json()
      console.log("Session check response:", data)

      if (data.isLoggedIn && data.userId) {
        console.log("Session valid, user logged in:", data.userId)

        // Fetch user details
        try {
          const userResponse = await fetch("/api/users/me")
          if (userResponse.ok) {
            const userData = await userResponse.json()
            console.log("User data fetched successfully:", userData)
            setUser({
              id: data.userId,
              name: userData.user?.name || "User",
              email: userData.user?.email,
              role: data.userRole || "user",
            })
          } else {
            console.warn("Failed to fetch user details:", userResponse.status, userResponse.statusText)
            // If we can't get user details, still set the basic user info
            setUser({
              id: data.userId,
              role: data.userRole || "user",
            })
          }
        } catch (error) {
          console.error("Error fetching user details:", error)
          // Set basic user info on error
          setUser({
            id: data.userId,
            role: data.userRole || "user",
          })
        }

        setIsLoading(false)
        return true
      } else {
        console.log("No active session found")
        setUser(null)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Error checking session:", error)
      setUser(null)
      setIsLoading(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  useEffect(() => {
    // Check session on initial load
    checkSession().then((isLoggedIn) => {
      // If not logged in and not already on login page, redirect to login
      if (!isLoggedIn && pathname !== "/login") {
        router.push("/login")
      }
      // If logged in and on login page, redirect to channels
      else if (isLoggedIn && pathname === "/login") {
        router.push("/channels/general")
      }
    })

    // Set up periodic session check
    const intervalId = setInterval(
      () => {
        checkSession()
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(intervalId)
  }, [pathname, router])

  return (
    <SessionContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        checkSession,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
