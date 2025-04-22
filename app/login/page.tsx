"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import PublicHeader from "@/components/public-header"
import LoadingScreen from "@/components/loading-screen"
import { Loader2, AlertCircle } from "lucide-react"
import { SwiftLogo } from "@/components/swift-logo"
import { DebugAuth } from "@/components/debug-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isLoading, currentUser, isAuthenticated, authError, clearAuthError } = useAuth()
  const router = useRouter()

  // If user is already authenticated, redirect to channels
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/channels")
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAuthError()
    setIsSubmitting(true)

    try {
      console.log("Attempting login with:", { email, password })
      await login(email, password)
      // Don't redirect here - let the useEffect handle it
    } catch (err) {
      console.error("Login error:", err)
      // Error is handled by the auth context and displayed via authError
    } finally {
      setIsSubmitting(false)
    }
  }

  // For demo purposes, let's add quick login functions
  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    clearAuthError()
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsSubmitting(true)

    try {
      console.log("Attempting demo login with:", { email: demoEmail, password: demoPassword })
      await login(demoEmail, demoPassword)
      // Don't redirect here - let the useEffect handle it
    } catch (err) {
      console.error("Demo login error:", err)
      // Error is handled by the auth context and displayed via authError
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isAuthenticated) {
    return <LoadingScreen />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-swift-primary/10 dark:from-swift-accent dark:to-swift-accent/80">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <SwiftLogo size="lg" />
            </div>
            <CardTitle className="text-2xl text-center">Log in to Swift</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-swift-primary/20 focus-visible:ring-swift-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-swift-primary hover:text-swift-primary/80">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-swift-primary/20 focus-visible:ring-swift-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-swift-primary hover:bg-swift-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </Button>
            </form>
            <div className="mt-6 space-y-4">
              <div className="text-sm text-gray-500 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                <p className="font-medium mb-1">Demo Accounts:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm truncate mr-2">
                      Regular User: john.doe@example.com / password123
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDemoLogin("john.doe@example.com", "password123")}
                      disabled={isSubmitting}
                      className="text-swift-primary hover:text-swift-primary/80 hover:bg-swift-primary/10"
                    >
                      Use
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm truncate mr-2">Admin: admin@example.com / admin123</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDemoLogin("admin@example.com", "admin123")}
                      disabled={isSubmitting}
                      className="text-swift-primary hover:text-swift-primary/80 hover:bg-swift-primary/10"
                    >
                      Use
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm truncate mr-2">V0 Admin: pberejnoy@v0.com / Sl@ckV0</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDemoLogin("pberejnoy@v0.com", "Sl@ckV0")}
                      disabled={isSubmitting}
                      className="text-swift-primary hover:text-swift-primary/80 hover:bg-swift-primary/10"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-swift-primary hover:text-swift-primary/80">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <DebugAuth />
    </div>
  )
}
