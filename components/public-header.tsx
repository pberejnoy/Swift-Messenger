"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SwiftLogo } from "@/components/swift-logo"

export default function PublicHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on client side only
  useEffect(() => {
    try {
      // Try to get auth status from localStorage
      const token = localStorage.getItem("authToken")
      const user = localStorage.getItem("currentUser")
      setIsAuthenticated(!!(token || user))
    } catch (error) {
      console.error("Error checking auth status:", error)
      setIsAuthenticated(false)
    }
  }, [])

  return (
    <header className="border-b bg-white dark:bg-swift-accent">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SwiftLogo size="md" linkTo={isAuthenticated ? "/channels/general" : "/"} />
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button asChild className="bg-swift-primary hover:bg-swift-primary/90">
              <Link href="/channels/general">Go to App</Link>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                className="border-swift-primary text-swift-primary hover:bg-swift-primary/10"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-swift-primary hover:bg-swift-primary/90">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
