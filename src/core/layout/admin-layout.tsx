import type React from "react"
import Link from "next/link"
import { routes } from "@/src/core/routing/routes"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, LogOut } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * AdminLayout - Layout component for admin pages
 * Provides a sidebar with navigation links to different admin sections
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-muted p-4 flex flex-col border-r">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Swift Messenger</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem href={routes.admin.dashboard} icon={<LayoutDashboard className="h-5 w-5" />}>
            Dashboard
          </NavItem>
          <NavItem href={routes.admin.users} icon={<Users className="h-5 w-5" />}>
            Users
          </NavItem>
          <NavItem href={routes.admin.channels} icon={<MessageSquare className="h-5 w-5" />}>
            Channels
          </NavItem>
          <NavItem href={routes.admin.logs} icon={<FileText className="h-5 w-5" />}>
            System Logs
          </NavItem>
          <NavItem href={routes.settings} icon={<Settings className="h-5 w-5" />}>
            Settings
          </NavItem>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href={routes.dashboard}>
              <LogOut className="h-5 w-5 mr-2" />
              Exit Admin
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-6 px-4">{children}</div>
      </div>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}

function NavItem({ href, icon, children }: NavItemProps) {
  return (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>
        {icon}
        <span className="ml-2">{children}</span>
      </Link>
    </Button>
  )
}
