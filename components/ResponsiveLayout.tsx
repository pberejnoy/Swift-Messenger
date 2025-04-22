"use client"

import type React from "react"
// Removing sidebar-related state and refs
// const [showSidebar, setShowSidebar] = useState(showSidebarByDefault)
// const [isMobile, setIsMobile] = useState(false)
// const sidebarRef = useRef<HTMLDivElement>(null)
// const toggleButtonRef = useRef<HTMLButtonElement>(null)
// const justOpenedRef = useRef(false)

export function ResponsiveLayout({ sidebar, content }: { sidebar: React.ReactNode; content: React.ReactNode }) {
  // Removing all sidebar-related logic and event listeners
  // This component now simply renders the content without managing sidebar visibility

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main content only - sidebar is now managed by MobileSidebar.tsx */}
      <div className="flex-1 overflow-hidden">{content}</div>
    </div>
  )
}
