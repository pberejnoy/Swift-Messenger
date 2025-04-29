"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { routes } from "../routing/routes"
import { cn } from "@/src/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, MessageSquare, FileText, Settings, LogOut } from "lucide-react"
import { useAuth } from "../auth/auth-provider"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navItems = [
    {
      title: "Dashboard",
      href: routes.protected.admin.dashboard,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: routes.protected.admin.users,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Channels",
      href: routes.protected.admin.channels,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "System Logs",
      href: routes.protected.admin.logs,
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: routes.protected.settings,
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-screen flex-col border-r bg-muted/10">
      <div className="p-6">
        <Link href={routes.protected.admin.dashboard} className="flex items-center">
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname && pathname === item.href ? "bg-muted font-medium" : "font-normal",
            )}
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => logout()}>
          <LogOut className="h-5 w-5 mr-3" />
          <span>Log out</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start mt-2" asChild>
          <Link href={routes.protected.dashboard}>
            <span>Exit Admin</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
