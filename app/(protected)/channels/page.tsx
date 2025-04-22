"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Redirect to general channel by default using client-side navigation
export default function ChannelsPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/channels/general")
  }, [router])

  // Show a loading state or nothing while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Redirecting to general channel...</p>
    </div>
  )
}
