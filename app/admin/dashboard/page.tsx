"use client"

import { AdminRoute } from "@/src/core/auth/admin-route"
import { AdminLayout } from "@/src/core/layout/admin-layout"
import { AdminDashboard } from "@/src/features/admin/dashboard"

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AdminRoute>
  )
}
