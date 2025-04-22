"use client"

import { useEffect, useState, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { X } from "lucide-react"

export default function MobileSidebarOverlay() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Listen for toggle events
  useEffect(() => {
    const toggleSidebar = () => {
      setIsOpen((prev) => !prev)
    }

    window.addEventListener("toggleMobileSidebar", toggleSidebar)
    return () => {
      window.removeEventListener("toggleMobileSidebar", toggleSidebar)
    }
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Prevent body scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 dark:bg-gray-900 text-white md:hidden"
      >
        <div className="flex justify-end p-2">
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <Sidebar />
      </div>
    </>
  )
}
