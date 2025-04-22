"use client"

import type React from "react"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

interface ErrorReportingOptions {
  shouldRedirect?: boolean
  redirectPath?: string
  logToConsole?: boolean
  logToServer?: boolean
}

/**
 * A hook for reporting errors in the application.
 *
 * @param options Configuration options for error reporting
 * @returns Functions for handling and reporting errors
 */
export function useErrorReporting(options: ErrorReportingOptions = {}) {
  const { shouldRedirect = false, redirectPath = "/error", logToConsole = true, logToServer = true } = options

  const router = useRouter()

  /**
   * Reports an error to the configured destinations.
   */
  const reportError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      // Log to console if enabled
      if (logToConsole) {
        console.error("Error caught:", error)
        if (errorInfo) {
          console.error("Component stack:", errorInfo.componentStack)
        }
      }

      // Log to server if enabled
      if (logToServer) {
        // In a real app, you would send this to your error tracking service
        // Example: Sentry, LogRocket, etc.
        try {
          // This is a placeholder for actual error reporting
          fetch("/api/log-error", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: error.message,
              stack: error.stack,
              componentStack: errorInfo?.componentStack,
              timestamp: new Date().toISOString(),
            }),
          }).catch((e) => {
            console.error("Failed to report error to server:", e)
          })
        } catch (e) {
          console.error("Failed to report error to server:", e)
        }
      }

      // Redirect if enabled
      if (shouldRedirect) {
        router.push(redirectPath)
      }
    },
    [logToConsole, logToServer, shouldRedirect, redirectPath, router],
  )

  /**
   * A function to handle errors in async functions.
   */
  const handleAsyncError = useCallback(async <T>(\
    promise: Promise<T>,
    errorMessage = 'An error occurred'
  ): Promise<T> => {
  try {
    return await promise
  } catch (error) {
    const enhancedError = error instanceof Error ? error : new Error(`${errorMessage}: ${String(error)}`)

    reportError(enhancedError)
    throw enhancedError
  }
}
, [reportError])

return {
    reportError,
    handleAsyncError,
  }
}
