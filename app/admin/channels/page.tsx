"use client"

import { AdminRoute } from "@/src/core/auth/admin-route"
import { AdminLayout } from "@/src/core/layout"

export default function AdminChannelsPage() {
  return (
    <AdminRoute>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">Channel Management</h1>
          <p className="text-muted-foreground">
            This page is under construction. Channel management features will be available soon.
          </p>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}
