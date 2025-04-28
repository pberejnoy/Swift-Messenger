"use client"

import { useAuthContext } from "@/src/core/auth/auth-provider"

/**
 * useAuth - Custom hook for accessing authentication state
 * Provides user data, loading state, authentication status, and admin status
 */
export function useAuth() {
  const { user, loading, isAdmin, metadata, logout } = useAuthContext()

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    isAdmin,
    metadata,
    logout,
  }
}
