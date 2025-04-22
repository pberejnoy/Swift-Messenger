"use client"

import type React from "react"
import { ErrorBoundary, type ErrorFallbackProps } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ServerCrash, RefreshCw, AlertTriangle } from "lucide-react"

interface ApiErrorBoundaryProps {
  children: React.ReactNode
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>
  onReset?: () => void
  onReport?: (error: Error, info: React.ErrorInfo) => void
}

/**
 * A specialized error boundary for API errors with a custom fallback UI.
 */
export function ApiErrorBoundary({
  children,
  fallbackComponent,
  onReset,
  onReport,
}: ApiErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary onReset={onReset} onReport={onReport} errorComponent={fallbackComponent || ApiErrorFallback}>
      {children}
    </ErrorBoundary>
  )
}

/**
 * A fallback component specifically designed for API errors.
 */
function ApiErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps): JSX.Element {
  // Determine if this is a network error
  const isNetworkError = error.message.includes("Failed to fetch") || error.message.includes("Network request failed")

  // Determine if this is an authentication error
  const isAuthError =
    error.message.includes("401") || error.message.includes("Unauthorized") || error.message.includes("Authentication")

  // Determine if this is a server error
  const isServerError = error.message.includes("500") || error.message.includes("Server Error")

  let title = "API Error"
  let description = "There was a problem communicating with the server."

  if (isNetworkError) {
    title = "Network Error"
    description = "Unable to connect to the server. Please check your internet connection."
  } else if (isAuthError) {
    title = "Authentication Error"
    description = "You are not authorized to access this resource. Please log in again."
  } else if (isServerError) {
    title = "Server Error"
    description = "The server encountered an error. Please try again later."
  }

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[200px] w-full">
      <Alert variant="destructive" className="mb-4 max-w-md w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <ServerCrash className="h-5 w-5" />
          {title}
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="text-sm mb-4">{description}</div>
          <div className="text-xs opacity-80 mb-4">{error.message}</div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Try again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
