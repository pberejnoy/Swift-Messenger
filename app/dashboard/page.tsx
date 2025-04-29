"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { useAuth } from "@/src/core/auth/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AuthDebug } from "@/src/components/debug/auth-debug"

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    console.log("Dashboard: Component mounted", { user: !!user, loading })
  }, [user, loading])

  // Handle any errors that might occur
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Dashboard: Unhandled error", event.error)
      setError("An unexpected error occurred. Please try refreshing the page.")
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={signOut} variant="outline">
            Sign out
          </Button>
        </div>

        {isClient && user && (
          <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Welcome, {user?.user_metadata?.username || user?.email || "User"}
            </h2>
            <p className="text-muted-foreground mb-6">
              You are now signed in to Swift Messenger. This is a protected route that only authenticated users can
              access.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/channels">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Go to Channels
                </Link>
              </Button>
            </div>
          </div>
        )}

        {isClient && user?.user_metadata?.is_admin && (
          <div className="bg-card p-6 rounded-lg shadow-sm border border-primary/20">
            <h2 className="text-xl font-semibold mb-4 text-primary">Admin Access</h2>
            <p className="text-muted-foreground mb-4">
              You have administrator privileges. You can access the admin panel to manage users, channels, and system
              settings.
            </p>
            <Button asChild>
              <Link href="/admin/dashboard">Access Admin Panel</Link>
            </Button>
          </div>
        )}
        {/* Add the debug component */}
        <AuthDebug />
      </div>
    </ProtectedRoute>
  )
}
