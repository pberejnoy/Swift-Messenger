"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

interface SafeNavigationProps {
  children: (navigate: (path: string) => void) => React.ReactNode
}

/**
 * A component that provides safe navigation functions that work with ErrorBoundary
 */
export function SafeNavigation({ children }: SafeNavigationProps) {
  const router = useRouter()

  const navigate = useCallback(
    (path: string) => {
      // Use router.push instead of redirect for client-side navigation
      router.push(path)
    },
    [router],
  )

  return <>{children(navigate)}</>
}

/**
 * A hook that provides safe navigation functions that work with ErrorBoundary
 */
export function useSafeNavigation() {
  const router = useRouter()

  const navigate = useCallback(
    (path: string) => {
      // Use router.push instead of redirect for client-side navigation
      router.push(path)
    },
    [router],
  )

  return { navigate }
}
