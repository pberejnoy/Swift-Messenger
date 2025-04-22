"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function FirebaseInit() {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Firebase environment variables are set
    const requiredEnvVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      setError(`Missing Firebase environment variables: ${missingVars.join(", ")}`)
    }
  }, [])

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <div className="mt-2 text-xs">
              Please add these environment variables to your .env.local file or Vercel project settings.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return null
}
