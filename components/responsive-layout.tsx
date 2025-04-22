"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  sidebar: React.ReactNode
  content: React.ReactNode
  showSidebarByDefault?: boolean
}

export function ResponsiveLayout({ sidebar, content, showSidebarByDefault = false }: ResponsiveLayoutProps) {
  const [showSidebar, setShowSidebar] = useState(showSidebarByDefault)
  const [isMobile, setIsMobile] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const justOpenedRef = useRef(false)

  // Toggle sidebar with improved event handling
  const handleToggleSidebar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSidebar((prev) => !prev)
  }

  // Detect mobile screen size with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const checkScreenSize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        const mobile = window.innerWidth < 768
        setIsMobile(mobile)

        // On larger screens, always show sidebar
        if (!mobile) {
          setShowSidebar(true)
        } else if (showSidebarByDefault !== showSidebar && mobile) {
          // Only update if the default changed and we're on mobile
          setShowSidebar(showSidebarByDefault)
        }

        timeoutId = null
      }, 100) // Debounce for 100ms
    }

    // Check on initial load
    checkScreenSize()

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)

    // Clean up
    return () => {
      window.removeEventListener("resize", checkScreenSize)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [showSidebarByDefault, showSidebar])

  // Improved outside click handler using composedPath()
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // Skip if we just opened the sidebar
      if (justOpenedRef.current) return

      // Use composedPath() for more reliable element detection
      const path = e.composedPath && e.composedPath()

      // If composedPath is available, use it for more reliable detection
      if (path) {
        const clickedInsideSidebar = sidebarRef.current && path.includes(sidebarRef.current)
        const clickedOnToggleButton = toggleButtonRef.current && path.includes(toggleButtonRef.current)

        // Only close if clicked outside both sidebar and toggle button
        if (!clickedInsideSidebar && !clickedOnToggleButton) {
          setShowSidebar(false)
        }
      } else {
        // Fallback to traditional method if composedPath not available
        const target = e.target as Node
        if (
          sidebarRef.current &&
          !sidebarRef.current.contains(target) &&
          toggleButtonRef.current &&
          !toggleButtonRef.current.contains(target)
        ) {
          setShowSidebar(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  // Add event listener for custom closeMobileSidebar event
  useEffect(() => {
    const handleCloseSidebar = () => {
      if (isMobile) {
        setShowSidebar(false)
      }
    }

    window.addEventListener("closeMobileSidebar", handleCloseSidebar)

    return () => {
      window.removeEventListener("closeMobileSidebar", handleCloseSidebar)
    }
  }, [isMobile])

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && showSidebar) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobile, showSidebar])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Toggle Button - Placed OUTSIDE the sidebar */}
      <button
        ref={toggleButtonRef}
        onClick={handleToggleSidebar}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 fixed top-3 left-3 z-[100] md:hidden bg-background/80 backdrop-blur-sm border border-border"
        aria-label="Open menu"
        aria-expanded={showSidebar}
        aria-controls="mobile-sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
          role="presentation"
        />
      )}

      {/* Sidebar - Properly using ref={sidebarRef} to wrap ALL sidebar content */}
      <aside
        ref={sidebarRef}
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 w-[280px] z-50 bg-background border-r shadow-lg overflow-y-auto",
          "transition-transform duration-300 ease-in-out",
          showSidebar ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:shadow-none",
        )}
      >
        {sidebar}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">{content}</div>
    </div>
  )
}
