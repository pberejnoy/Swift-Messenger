"use client"

import { AdminRoute } from "@/src/core/auth/admin-route"
import { AdminLayout } from "@/src/core/layout/admin-layout"

export default function AdminLogsPage() {
  return (
    <AdminRoute>
      <AdminLayout>
        <div>
          <h1 className="text-3xl font-bold mb-6">System Logs</h1>
          <p className="text-muted-foreground">This page is under construction. System logs will be available soon.</p>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}
