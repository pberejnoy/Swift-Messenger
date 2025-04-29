import type { ReactNode } from "react"
import { AdminSidebar } from "@/src/core/layout/admin-sidebar"
import { AdminHeader } from "@/src/core/layout/admin-header"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-[250px_1fr] bg-background">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
