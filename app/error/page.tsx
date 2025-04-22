"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"

export default function ErrorPage() {
  const router = useRouter()

  // Get error information from URL if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorMessage = params.get("message")

    if (errorMessage) {
      console.error("Error from URL:", errorMessage)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>

        <p className="text-gray-500 mb-6">We apologize for the inconvenience. An unexpected error has occurred.</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button onClick={() => router.push("/")} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
