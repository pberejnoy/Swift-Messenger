"use client"

import React from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AuthSafeErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // If the error contains "useAuth must be used within an AuthProvider", don't catch it
    if (error.message && error.message.includes("useAuth must be used within an AuthProvider")) {
      throw error // Re-throw the auth error
    }

    // Otherwise, update state to display fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // If the error contains "useAuth must be used within an AuthProvider", don't catch it
    if (error.message && error.message.includes("useAuth must be used within an AuthProvider")) {
      console.warn("Auth provider error detected, not catching:", error)
      return // Don't handle auth errors
    }

    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert className="max-w-md">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription className="mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </div>
              <Button onClick={() => this.setState({ hasError: false, error: null })} className="w-full">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
