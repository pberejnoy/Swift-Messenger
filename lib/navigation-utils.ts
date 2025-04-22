"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"

/**
 * A hook that provides safe navigation functions
 * to prevent the "Something went wrong Redirect" error
 */
export function useSafeNavigation() {
  const router = useRouter()

  const navigateSafely = useCallback(
    (path: string) => {
      // Use setTimeout to ensure navigation happens after the current execution context
      setTimeout(() => {
        router.push(path)
      }, 0)
    },
    [router],
  )

  return { navigateSafely }
}
