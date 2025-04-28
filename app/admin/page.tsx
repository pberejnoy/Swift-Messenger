"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { routes } from "@/src/core/routing/routes"
import { AdminRoute } from "@/src/core/auth/admin-route"

export default function AdminIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.push(routes.admin.dashboard)
  }, [router])

  return (
    <AdminRoute>
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4">Redirecting to admin dashboard...</p>
        </div>
      </div>
    </AdminRoute>
  )
}
