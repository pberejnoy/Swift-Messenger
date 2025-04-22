"use client"

import type React from "react"

import { useState } from "react"
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
import { SwiftLogo } from "@/components/swift-logo"
import { AlertCircle, Loader2 } from "lucide-react"
import FirebaseConfigChecker from "@/components/firebase-config-checker"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, isLoading, authError, clearAuthError } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearAuthError()
    setValidationError(null)

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)

    try {
      await register(name, email, password)
      router.push("/channels")
    } catch (err) {
      // Error is handled by the auth context and displayed via authError
      console.error("Registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
            <CardTitle className="text-2xl text-center">Create an account</CardTitle>
            <CardDescription className="text-center">Enter your details to create your Swift account</CardDescription>
          </CardHeader>
          <CardContent>
            <FirebaseConfigChecker />

            {(validationError || authError) && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError || authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-swift-primary/20 focus-visible:ring-swift-primary"
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-swift-primary/20 focus-visible:ring-swift-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-swift-primary hover:text-swift-primary/80">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
