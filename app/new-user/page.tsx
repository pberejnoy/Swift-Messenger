"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Copy, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewUserPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newUserCredentials, setNewUserCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const createTestUser = async () => {
    try {
      setIsCreating(true)
      setError(null)
      setNewUserCredentials(null)

      const response = await fetch("/api/diagnostic/create-test-user", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setNewUserCredentials({
          email: data.credentials.email,
          password: data.credentials.password,
        })
      } else {
        setError(data.error || "Failed to create test user")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while creating test user")
    } finally {
      setIsCreating(false)
    }
  }

  const copyCredentials = () => {
    if (newUserCredentials) {
      const text = `Email: ${newUserCredentials.email}\nPassword: ${newUserCredentials.password}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const goToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New User Account</CardTitle>
          <CardDescription>Create a new user account with automatically generated credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {newUserCredentials ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>New user account created successfully!</AlertDescription>
              </Alert>

              <div className="rounded-md border p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Your New Credentials</h3>
                  <Button variant="outline" size="sm" onClick={copyCredentials} className="flex items-center">
                    <Copy className="h-4 w-4 mr-1" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Email:</span> {newUserCredentials.email}
                  </div>
                  <div>
                    <span className="font-semibold">Password:</span> {newUserCredentials.password}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">
                If you're having trouble logging in with existing accounts, you can create a new user account with
                automatically generated credentials.
              </p>
              <Button onClick={createTestUser} disabled={isCreating} className="w-full">
                {isCreating ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Creating User...
                  </span>
                ) : (
                  "Create New User"
                )}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
          {newUserCredentials && (
            <Button onClick={goToLogin} className="flex items-center">
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
