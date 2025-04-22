"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MessagingProvider } from "@/contexts/messaging-context"
import Header from "@/components/header"
import LoadingScreen from "@/components/loading-screen"
import { Sidebar } from "@/components/sidebar"
import { useMobile } from "@/hooks/use-mobile"
import { SwiftLogo } from "@/components/swift-logo"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const { isMobile } = useMobile()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only run this on mobile
      if (window.innerWidth >= 768) return

      // Check if the click was outside the sidebar
      const sidebar = document.getElementById("sidebar")
      const menuButton = document.getElementById("mobile-menu-button")

      if (sidebar && !sidebar.contains(e.target as Node) && menuButton && !menuButton.contains(e.target as Node)) {
        setShowMobileSidebar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle route changes - close mobile sidebar
  useEffect(() => {
    const handleRouteChange = () => {
      setShowMobileSidebar(false)
    }

    window.addEventListener("popstate", handleRouteChange)
    return () => window.removeEventListener("popstate", handleRouteChange)
  }, [])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (showMobileSidebar && window.innerWidth < 768) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showMobileSidebar])

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/login")
    }
  }, [currentUser, isLoading, router])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return null // Will redirect in the useEffect
  }

  return (
    <MessagingProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile overlay - only visible when sidebar is open on mobile */}
        {showMobileSidebar && isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Sidebar - always visible on desktop, conditionally visible on mobile */}
        <div
          id="sidebar"
          className={`
            fixed md:static inset-y-0 left-0 z-50 
            w-64 flex-shrink-0 overflow-y-auto
            bg-swift-accent dark:bg-gray-900 text-white
            transition-transform duration-300 ease-in-out
            ${showMobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Only show logo in sidebar on desktop */}
          {!isMobile && (
            <div className="h-14 flex items-center px-4 border-b border-swift-accent/20">
              <SwiftLogo size="md" withText={true} />
            </div>
          )}

          <Sidebar onCloseMobileSidebar={() => setShowMobileSidebar(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
          <Header
            showMobileMenuButton={true}
            onToggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
            isMobileSidebarOpen={showMobileSidebar}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </MessagingProvider>
  )
}
