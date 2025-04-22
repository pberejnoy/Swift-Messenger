"use client"

import { useRef, useState, useEffect } from "react"
import { Menu } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const path = event.composedPath()
      if (
        sidebarRef.current &&
        !path.includes(sidebarRef.current) &&
        toggleRef.current &&
        !path.includes(toggleRef.current)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handler, true)
    document.addEventListener("touchstart", handler, true)
    return () => {
      document.removeEventListener("mousedown", handler, true)
      document.removeEventListener("touchstart", handler, true)
    }
  }, [])

  return (
    <>
      {/* Toggle Button - Only visible on mobile */}
      <button
        ref={toggleRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen((prev) => !prev)
        }}
        className="inline-flex items-center justify-center gap-2 rounded-md h-10 w-10 fixed top-3 left-3 z-[100] md:hidden bg-background/80 backdrop-blur-sm border border-border"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay - Only visible on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar - Hidden on mobile by default, always visible on desktop */}
      <aside
        id="mobile-sidebar"
        ref={sidebarRef}
        className={`
    z-50 bg-background border-r shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out
    fixed inset-y-0 left-0 w-[280px] ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:relative md:translate-x-0 md:flex md:flex-col md:w-[280px] md:shadow-none md:z-0
  `}
      >
        {/* Top: logo */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/channels/general" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swift_main_logo-yYv27JMiVlKt95nyLAReob3ASP5MIs.png"
              alt="Swift Messenger"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-bold text-swift-accent dark:text-white text-lg">Swift</span>
          </Link>
        </div>

        {/* Channels & DMs */}
        <div className="p-2 space-y-4">
          {/* Channels */}
          <div>
            <div className="text-sm font-semibold mb-1 text-muted-foreground">Channels</div>
            <div className="space-y-1">
              <Link
                href="/channels/general"
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted text-sm"
              >
                <span>#</span>
                <span>general</span>
              </Link>
              <Link
                href="/channels/random"
                className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted text-sm"
              >
                <span>#</span>
                <span>random</span>
              </Link>
            </div>
          </div>

          {/* DMs */}
          <div>
            <div className="text-sm font-semibold mb-1 text-muted-foreground">Direct Messages</div>
            <div className="space-y-1">
              <Link href="/dm/john" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted text-sm">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/thoughtful-brunette-HnxVD6PIdbqSGUkDy9VPjQpQUQMGaS.png"
                  alt="John"
                  className="h-5 w-5 rounded-full"
                />
                <span>John Doe</span>
              </Link>
              <Link href="/dm/jane" className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted text-sm">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/attachments/gen-images/public/sunlit-blonde-eUrb7pDe2Avm0lnOJspcUxA7Vg1QQM.png"
                  alt="Jane"
                  className="h-5 w-5 rounded-full"
                />
                <span>Jane Smith</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Profile */}
        <div className="border-t p-2 mt-auto">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-md">
            <div className="flex items-center gap-2">
              <img src="/placeholder.svg" className="h-6 w-6 rounded-full" alt="User" />
              <span className="text-sm font-medium truncate max-w-[140px]">Pavel Berejnoy</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
