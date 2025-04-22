"use client"

import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugAuth() {
  const { currentUser, isLoading, isAuthenticated } = useAuth()
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          Debug Auth
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Auth Debug</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              Close
            </Button>
          </div>
          <CardDescription className="text-xs">Current authentication state</CardDescription>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Is Loading:</strong> {isLoading ? "Yes" : "No"}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
          </div>
          <div>
            <strong>Current User:</strong> {currentUser ? "Exists" : "Null"}
          </div>
          {currentUser && (
            <div className="space-y-1 pt-2">
              <div>
                <strong>ID:</strong> {currentUser.id}
              </div>
              <div>
                <strong>Email:</strong> {currentUser.email}
              </div>
              <div>
                <strong>Display Name:</strong> {currentUser.displayName || "Not set"}
              </div>
              <div>
                <strong>Is Admin:</strong> {currentUser.isAdmin ? "Yes" : "No"}
              </div>
              <div>
                <strong>Avatar:</strong> {currentUser.avatar || "Not set"}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="destructive"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              localStorage.removeItem("currentUser")
              window.location.reload()
            }}
          >
            Clear Auth Data & Reload
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
