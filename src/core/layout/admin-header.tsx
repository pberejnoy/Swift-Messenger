"use client"

import { useAuth } from "../auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminHeader() {
  const { user, metadata } = useAuth()

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="border-b p-4 bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                alt={metadata?.username || user?.email || ""}
              />
              <AvatarFallback>{getInitials(metadata?.username || user?.email || "User")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{metadata?.username || user?.email || "Administrator"}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
