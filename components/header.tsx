"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Bell, HelpCircle, Search, Settings, User, X, Menu } from "lucide-react"
import { getInitials } from "@/lib/string-utils"
import { useMessaging } from "@/contexts/messaging-context"
import { toast } from "@/hooks/use-toast"
import { SwiftLogo } from "@/components/swift-logo"
import { useMobile } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

interface HeaderProps {
  showMobileMenuButton?: boolean
  onToggleMobileSidebar?: () => void
  isMobileSidebarOpen?: boolean
}

export default function Header({
  showMobileMenuButton = false,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}: HeaderProps) {
  const { currentUser, logout } = useAuth()
  const { channels, messages, activeChannel, setActiveChannel } = useMessaging()
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { isMobile } = useMobile()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchResults([])
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Focus search input when search is shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navigateToProfile = () => {
    try {
      router.push("/profile")
    } catch (error) {
      console.error("Error navigating to profile:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navigateToSettings = () => {
    try {
      router.push("/settings")
    } catch (error) {
      console.error("Error navigating to settings:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // Convert messages object to array for searching
      const allMessages: any[] = []
      Object.entries(messages).forEach(([channelId, channelMessages]) => {
        allMessages.push(
          ...channelMessages.map((msg) => ({
            ...msg,
            channelId,
          })),
        )
      })

      // Search messages
      const results = allMessages.filter((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))

      // Sort by recency
      results.sort((a, b) => b.createdAt - a.createdAt)

      // Limit to 10 results
      setSearchResults(results.slice(0, 10))
    } catch (error) {
      console.error("Error searching messages:", error)
      toast({
        title: "Search Error",
        description: "Failed to search messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (result: any) => {
    // Navigate to the channel and message
    if (result.channelId) {
      setActiveChannel(result.channelId)
      router.push(`/channels/${result.channelId}`)

      // Close search
      setShowSearch(false)
      setSearchResults([])
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 sm:px-6">
      {/* Left section with menu button (mobile only) and logo */}
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        {/* Only show mobile menu button on mobile */}
        {isMobile && showMobileMenuButton && (
          <Button
            id="mobile-menu-button"
            variant="ghost"
            size="icon"
            onClick={onToggleMobileSidebar}
            className="md:hidden"
            aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        )}

        {/* Only show logo in header on mobile */}
        {isMobile && <SwiftLogo size="sm" withText={false} />}
      </div>

      {/* Right section with search and user menu */}
      <div ref={searchContainerRef} className="relative flex items-center gap-2">
        {showSearch ? (
          <div className="flex-1 md:grow-0 md:w-[300px]">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search messages..."
                className="w-full bg-background pl-8 md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e)
                  }
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => {
                  setShowSearch(false)
                  setSearchResults([])
                  setSearchQuery("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Card className="absolute top-full mt-1 w-full z-50 max-h-[400px] overflow-auto">
                <CardContent className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2 pt-2">
                    {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
                  </div>
                  <div className="space-y-1">
                    {searchResults.map((result) => {
                      const channel = channels.find((c) => c.id === result.channelId)
                      const user = result.userId ? { displayName: "Unknown User" } : null

                      return (
                        <div
                          key={result.id}
                          className="p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center">
                              <span className="font-medium text-xs">{user?.displayName || "Unknown User"}</span>
                              <span className="mx-1 text-muted-foreground text-xs">in</span>
                              <span className="text-xs text-primary">#{channel?.name || result.channelId}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(result.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{highlightSearchTerm(result.content, searchQuery)}</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSearch(!showSearch)}>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
              <HelpCircle className="h-4 w-4" />
              <span className="sr-only">Help</span>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={currentUser?.avatar || "/placeholder-avatar.png"}
                  alt={currentUser?.displayName || "User"}
                />
                <AvatarFallback>{getInitials(currentUser?.displayName || currentUser?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={navigateToProfile}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={navigateToSettings}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Helper function to highlight search terms in results
function highlightSearchTerm(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${query})`, "gi"))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}
