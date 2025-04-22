"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface ClientRedirectProps {
  to: string
  replace?: boolean
}

/**
 * A component that performs client-side redirects safely with error boundaries
 */
export function ClientRedirect({ to, replace = false }: ClientRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    if (replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }, [router, to, replace])

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
