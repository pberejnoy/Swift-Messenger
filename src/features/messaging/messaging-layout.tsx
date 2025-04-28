"use client"

import type React from "react"
import { useState } from "react"
import { ChannelList } from "./channel-list"
import { DirectMessageList } from "@/src/features/direct-messages/direct-message-list"
import { Button } from "@/components/ui/button"
import { useSession } from "@/src/contexts/session-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, Settings, LogOut } from "lucide-react"

interface MessagingLayoutProps {
  children: React.ReactNode
}

/**
 * MessagingLayout - Layout component for the messaging section
 * Includes sidebar with channels and direct messages
 */
export function MessagingLayout({ children }: MessagingLayoutProps) {
  const { user, signOut } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col border-r bg-card transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="font-bold text-xl">Swift Messenger</h1>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close Sidebar</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b py-4">
            <ChannelList />
          </div>
          <div className="py-4">
            <DirectMessageList />
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                alt={user?.user_metadata?.username || user?.email}
              />
              <AvatarFallback>
                {user?.user_metadata?.username
                  ? user.user_metadata.username.substring(0, 2).toUpperCase()
                  : user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{user?.user_metadata?.username || user?.email}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log Out</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 bg-background md:hidden transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="font-bold text-xl">Swift Messenger</h1>
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close Menu</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b py-4">
            <ChannelList />
          </div>
          <div className="py-4">
            <DirectMessageList />
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={user?.user_metadata?.avatar_url || "/placeholder.svg"}
                alt={user?.user_metadata?.username || user?.email}
              />
              <AvatarFallback>
                {user?.user_metadata?.username
                  ? user.user_metadata.username.substring(0, 2).toUpperCase()
                  : user?.email?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{user?.user_metadata?.username || user?.email}</div>
              <div className="text-xs text-muted-foreground">Online</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log Out</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 border-b flex items-center px-4 justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
