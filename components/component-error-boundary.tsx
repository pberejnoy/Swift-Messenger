"use client"

import type React from "react"
import { ErrorBoundary, type ErrorFallbackProps } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PuzzleIcon, RefreshCw } from "lucide-react"

interface ComponentErrorBoundaryProps {
  children: React.ReactNode
  componentName?: string
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>
  onReset?: () => void
  onReport?: (error: Error, info: React.ErrorInfo) => void
}

/**
 * A specialized error boundary for UI components with a more compact fallback UI.
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  fallbackComponent,
  onReset,
  onReport,
}: ComponentErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary
      onReset={onReset}
      onReport={onReport}
      errorComponent={
        fallbackComponent || ((props) => <ComponentErrorFallback {...props} componentName={componentName} />)
      }
    >
      {children}
    </ErrorBoundary>
  )
}

interface ComponentErrorFallbackProps extends ErrorFallbackProps {
  componentName?: string
}

/**
 * A compact fallback component for UI component errors.
 */
function ComponentErrorFallback({
  error,
  resetErrorBoundary,
  componentName,
}: ComponentErrorFallbackProps): JSX.Element {
  return (
    <div className="p-2 w-full">
      <Alert variant="destructive" className="mb-2">
        <AlertTitle className="text-sm flex items-center gap-2">
          <PuzzleIcon className="h-4 w-4" />
          {componentName ? `Error in ${componentName}` : "Component Error"}
        </AlertTitle>
        <AlertDescription className="text-xs">
          <div className="mb-2">{error.message || "An unexpected error occurred in this component"}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetErrorBoundary}
            className="flex items-center gap-1 h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Reload
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
