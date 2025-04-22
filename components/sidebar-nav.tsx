"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
  }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")

  return (
    <nav className={cn("flex flex-col space-y-1 px-2", className)} {...props}>
      {items.map((item) => {
        // Check if this is a settings page with a tab parameter
        const isSettingsWithTab = item.href.startsWith("/settings?tab=") && pathname === "/settings"
        const tabValue = isSettingsWithTab ? item.href.split("=")[1] : null

        // Determine if this item is active
        const isActive =
          pathname === item.href ||
          (isSettingsWithTab && tab === tabValue) ||
          (pathname === "/settings" && item.href === "/settings" && !tab)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              isActive ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
