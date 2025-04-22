"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/types"
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser,
  updateUserProfile,
} from "@/lib/auth-service"
import { initializeDefaultData } from "@/lib/storage-utils"

// Define auth context type
type AuthContextType = {
  currentUser: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (profileData: Partial<User>) => Promise<User>
  authError: string | null
  clearAuthError: () => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the auth provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Clear auth error
  const clearAuthError = () => setAuthError(null)

  // Check for existing session on mount
  useEffect(() => {
    // Initialize default data if needed
    initializeDefaultData()

    // Check if user is authenticated
    const user = getCurrentUser()
    setCurrentUser(user)
    setIsLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true)
    clearAuthError()

    try {
      const user = await authLogin(email, password)
      setCurrentUser(user)
      return user
    } catch (error: any) {
      setAuthError(error.message || "Failed to log in")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true)
    clearAuthError()

    try {
      const user = await authRegister(name, email, password)
      setCurrentUser(user)
      return user
    } catch (error: any) {
      setAuthError(error.message || "Failed to register")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true)
    clearAuthError()

    try {
      await authLogout()
      setCurrentUser(null)
    } catch (error: any) {
      setAuthError(error.message || "Failed to log out")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update profile function
  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    setIsLoading(true)
    clearAuthError()

    try {
      if (!currentUser) {
        throw new Error("No user logged in")
      }

      const updatedUser = await updateUserProfile(currentUser.id, profileData)
      setCurrentUser(updatedUser)
      return updatedUser
    } catch (error: any) {
      setAuthError(error.message || "Failed to update profile")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    updateProfile,
    authError,
    clearAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
