"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircle, RefreshCw, AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  onReport?: (error: Error, errorInfo: ErrorInfo) => void
  errorComponent?: (props: ErrorFallbackProps) => ReactNode
}

export interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  resetErrorBoundary: () => void
  reportError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

// Check if an error is a Next.js redirect
function isRedirectError(error: Error): boolean {
  // Next.js redirects have a specific structure
  return (
    error.constructor.name === "Redirect" ||
    error.constructor.name === "RedirectError" ||
    // Check for the NEXT_REDIRECT symbol
    (error as any)?.digest?.startsWith("NEXT_REDIRECT") ||
    // Check for the message pattern in some Next.js versions
    /^Redirect to ".*"$/.test(error.message)
  )
}

/**
 * A reusable error boundary component that catches errors in its children
 * and displays a fallback UI instead of crashing the application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // If this is a Next.js redirect, don't treat it as an error
    if (isRedirectError(error)) {
      // Return null to let the redirect happen normally
      throw error
    }

    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // If this is a Next.js redirect, don't treat it as an error
    if (isRedirectError(error)) {
      // Let the redirect happen normally
      throw error
    }

    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({ errorInfo })

    // If onReport is provided, call it with the error and errorInfo
    if (this.props.onReport) {
      this.props.onReport(error, errorInfo)
    }
  }

  resetErrorBoundary = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })

    // If onReset is provided, call it
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  reportError = (): void => {
    // If onReport is provided and we have an error, call onReport
    if (this.props.onReport && this.state.error && this.state.errorInfo) {
      this.props.onReport(this.state.error, this.state.errorInfo)
    }
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, errorComponent } = this.props

    if (hasError && error) {
      // If a custom error component is provided, use it
      if (errorComponent) {
        return errorComponent({
          error,
          errorInfo,
          resetErrorBoundary: this.resetErrorBoundary,
          reportError: this.reportError,
        })
      }

      // If a fallback is provided, use it
      if (fallback) {
        return fallback
      }

      // Otherwise, use the default error fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          reportError={this.reportError}
        />
      )
    }

    // If there's no error, render the children
    return children
  }
}

/**
 * The default error fallback component that is displayed when an error occurs.
 */
export function DefaultErrorFallback({ error, resetErrorBoundary, reportError }: ErrorFallbackProps): JSX.Element {
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[200px] w-full">
      <Alert variant="destructive" className="mb-4 max-w-md w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          Something went wrong
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="text-sm mb-2">{error.message || "An unexpected error occurred"}</div>
          <div className="text-xs opacity-80 mb-4 max-h-[100px] overflow-auto">
            {error.stack ? <pre className="whitespace-pre-wrap">{error.stack}</pre> : null}
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Try again
            </Button>
            <Button variant="outline" size="sm" onClick={reportError}>
              Report issue
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

/**
 * A hook to create an error handler function that can be used with the ErrorBoundary component.
 */
export function useErrorHandler(onError?: (error: Error) => void): (error: unknown) => void {
  return (error: unknown) => {
    if (error instanceof Error) {
      // Check if this is a Next.js redirect
      if (isRedirectError(error)) {
        // Let the redirect happen normally
        throw error
      }

      if (onError) {
        onError(error)
      }
      throw error
    }

    // If it's not an Error, convert it to one
    throw new Error(error instanceof Object ? JSON.stringify(error) : String(error))
  }
}
