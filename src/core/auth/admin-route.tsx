"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/core/auth/auth-provider"
import { LoadingScreen } from "@/src/core/components/loading-screen"

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const isAdmin = user?.user_metadata?.is_admin === true

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      console.log("AdminRoute: No user, redirecting to login")
      router.push("/login")
      return
    }

    // If user is not an admin, redirect to unauthorized
    if (!loading && user && !isAdmin) {
      console.log("AdminRoute: User is not admin, redirecting to unauthorized")
      router.push("/unauthorized")
    }
  }, [user, loading, isAdmin, router])

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />
  }

  // If no user or not admin, don't render children
  if ((!user || !isAdmin) && !loading) {
    return null
  }

  // User is authenticated and is admin, render children
  return <>{children}</>
}
