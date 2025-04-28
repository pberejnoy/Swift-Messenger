"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/src/contexts/session-provider"
import { routes } from "@/src/core/routing/routes"

export default function LogoutPage() {
  const { signOut } = useSession()
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      await signOut()
      router.push(routes.login)
    }

    performLogout()
  }, [signOut, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4">Signing out...</p>
      </div>
    </div>
  )
}
