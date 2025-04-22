"use client"

import type React from "react"
import { ComponentErrorBoundary } from "@/components/component-error-boundary"
import { ApiErrorBoundary } from "@/components/api-error-boundary"
import { ErrorBoundary, type ErrorFallbackProps } from "@/components/error-boundary"

type ErrorBoundaryType = "component" | "api" | "default"

interface WithErrorBoundaryOptions {
  type?: ErrorBoundaryType
  componentName?: string
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>
  onReset?: () => void
  onReport?: (error: Error, info: React.ErrorInfo) => void
}

/**
 * A higher-order component that wraps a component with an error boundary.
 *
 * @param Component The component to wrap
 * @param options Configuration options for the error boundary
 * @returns A new component wrapped with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
): React.FC<P> {
  const {
    type = "default",
    componentName = Component.displayName || Component.name,
    fallbackComponent,
    onReset,
    onReport,
  } = options

  const WrappedComponent: React.FC<P> = (props) => {
    if (type === "component") {
      return (
        <ComponentErrorBoundary
          componentName={componentName}
          fallbackComponent={fallbackComponent}
          onReset={onReset}
          onReport={onReport}
        >
          <Component {...props} />
        </ComponentErrorBoundary>
      )
    }

    if (type === "api") {
      return (
        <ApiErrorBoundary fallbackComponent={fallbackComponent} onReset={onReset} onReport={onReport}>
          <Component {...props} />
        </ApiErrorBoundary>
      )
    }

    return (
      <ErrorBoundary errorComponent={fallbackComponent} onReset={onReset} onReport={onReport}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${componentName})`
  return WrappedComponent
}
