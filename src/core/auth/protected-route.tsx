"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/src/core/auth/auth-provider"
import { LoadingScreen } from "@/src/core/components/loading-screen"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      console.log("ProtectedRoute: No user, redirecting to login")
      router.push(`/login?redirect=${encodeURIComponent(pathname || "")}`)
    }
  }, [user, loading, router, pathname])

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />
  }

  // If no user and not loading, don't render children
  if (!user && !loading) {
    return null
  }

  // User is authenticated, render children
  return <>{children}</>
}
