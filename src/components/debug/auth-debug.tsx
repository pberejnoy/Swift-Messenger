"use client"

import { useAuth } from "@/src/core/auth/auth-provider"

export function AuthDebug() {
  const { user, loading, error } = useAuth()

  return (
    <div className="mt-8 p-4 bg-muted rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Auth Debug</h2>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Loading:</strong> {loading ? "true" : "false"}
        </p>
        <p>
          <strong>User:</strong> {user ? "Authenticated" : "Not authenticated"}
        </p>
        {user && (
          <>
            <p>
              <strong>User ID:</strong> {user.id}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Username:</strong> {user.user_metadata?.username || "Not set"}
            </p>
            <p>
              <strong>Is Admin:</strong> {user.user_metadata?.is_admin ? "Yes" : "No"}
            </p>
          </>
        )}
        {error && (
          <p className="text-destructive">
            <strong>Error:</strong> {error.message}
          </p>
        )}
      </div>
    </div>
  )
}
