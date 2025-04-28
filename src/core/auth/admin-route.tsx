"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/src/contexts/session-provider"
import { routes } from "@/src/core/routing/routes"

interface AdminRouteProps {
  children: React.ReactNode
}

/**
 * AdminRoute - A component that protects routes that should only be accessible by admins
 * Redirects to unauthorized page if the user is not an admin
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAdmin } = useSession()
  const router = useRouter()

  useEffect(() => {
    // First check if the user is authenticated
    if (!isLoading && !user) {
      router.push(routes.login)
      return
    }

    // Then check if the user is an admin
    if (!isLoading && user && !isAdmin) {
      console.log("User is not an admin, redirecting to unauthorized page")
      router.push(routes.unauthorized)
    }
  }, [user, isLoading, isAdmin, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null // Will redirect in the useEffect
  }

  return <>{children}</>
}
