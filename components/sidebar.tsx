"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useMessaging } from "@/contexts/messaging-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronDown, Hash, LogOut, Plus, Settings, User, X, Lock } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getInitials } from "@/lib/string-utils"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onCloseMobileSidebar?: () => void
}

export function Sidebar({ onCloseMobileSidebar }: SidebarProps) {
  const { currentUser, logout } = useAuth()
  const {
    channels,
    users,
    activeChannel,
    activeDirectMessage,
    setActiveChannel,
    setActiveDirectMessage,
    createChannel,
  } = useMessaging()
  const [isCreatingChannel, setIsCreatingChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [showChannels, setShowChannels] = useState(true)
  const [showDirectMessages, setShowDirectMessages] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { isMobile } = useMobile()

  // Set active channel or DM based on the current path
  useEffect(() => {
    if (pathname) {
      // Handle channel routes
      if (pathname.startsWith("/channels/")) {
        const channelId = pathname.split("/")[2]
        if (channelId && (!activeChannel || activeChannel.id !== channelId)) {
          const channel = channels.find((c) => c.id === channelId)
          if (channel) {
            setActiveChannel(channelId)
          }
        }
      }

      // Handle DM routes
      else if (pathname.startsWith("/direct-messages/")) {
        const userId = pathname.split("/")[2]
        if (userId && currentUser && userId !== currentUser.id) {
          setActiveDirectMessage(userId)
        }
      }
    }
  }, [pathname, channels, activeChannel, setActiveChannel, setActiveDirectMessage, currentUser])

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newChannelName.trim()) return

    try {
      const newChannel = await createChannel(newChannelName, newChannelDescription, isPrivate)
      setNewChannelName("")
      setNewChannelDescription("")
      setIsPrivate(false)
      setIsCreatingChannel(false)

      // Navigate to the new channel
      if (newChannel) {
        navigateToChannel(newChannel.id)
      }
    } catch (error) {
      console.error("Error creating channel:", error)
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Enhanced navigation function with improved mobile handling
  const navigateToChannel = async (channelId: string) => {
    if (isNavigating) return // Prevent multiple clicks

    setIsNavigating(true)
    try {
      // Set the active channel in context
      setActiveChannel(channelId)

      // Navigate to the channel page
      await router.push(`/channels/${channelId}`)

      // Close mobile sidebar if needed
      if (isMobile && onCloseMobileSidebar) {
        onCloseMobileSidebar()
      }
    } catch (error) {
      console.error("Error navigating to channel:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to channel. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsNavigating(false)
    }
  }

  // Enhanced direct message navigation with error handling and loading state
  const navigateToDirectMessage = async (userId: string) => {
    if (isNavigating) return // Prevent multiple clicks

    setIsNavigating(true)
    try {
      // Set the active direct message in context
      setActiveDirectMessage(userId)

      // Navigate to the direct message page
      await router.push(`/direct-messages/${userId}`)

      // Close mobile sidebar if needed
      if (isMobile && onCloseMobileSidebar) {
        onCloseMobileSidebar()
      }
    } catch (error) {
      console.error("Error navigating to direct message:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to conversation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsNavigating(false)
    }
  }

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

  const navigateToProfile = async () => {
    if (isNavigating) return // Prevent multiple clicks

    setIsNavigating(true)
    try {
      await router.push("/profile")

      // Close mobile sidebar if needed
      if (isMobile && onCloseMobileSidebar) {
        onCloseMobileSidebar()
      }
    } catch (error) {
      console.error("Error navigating to profile:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsNavigating(false)
    }
  }

  const navigateToSettings = async () => {
    if (isNavigating) return // Prevent multiple clicks

    setIsNavigating(true)
    try {
      await router.push("/settings")

      // Close mobile sidebar if needed
      if (isMobile && onCloseMobileSidebar) {
        onCloseMobileSidebar()
      }
    } catch (error) {
      console.error("Error navigating to settings:", error)
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsNavigating(false)
    }
  }

  // Filter out current user from the users list
  const otherUsers = users.filter((user) => user.id !== currentUser?.id)

  return (
    <div className="flex flex-col h-full">
      {/* Mobile close button - only visible on mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 md:hidden text-white"
          onClick={onCloseMobileSidebar}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close menu</span>
        </Button>
      )}

      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          <div className="mb-4">
            <div
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer"
              onClick={() => setShowChannels(!showChannels)}
              role="button"
              tabIndex={0}
              aria-expanded={showChannels}
              aria-controls="channels-list"
            >
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-300">
                <ChevronDown className={`h-4 w-4 transition-transform ${showChannels ? "" : "-rotate-90"}`} />
                <span>Channels</span>
              </div>
              <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-gray-300 hover:text-white hover:bg-swift-accent/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Channel</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateChannel}>
                    <DialogHeader>
                      <DialogTitle>Create a new channel</DialogTitle>
                      <DialogDescription>
                        Channels are where your team communicates. They're best when organized around a topic.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Channel name</Label>
                        <Input
                          id="name"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="e.g. marketing"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                          placeholder="What's this channel about?"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
                        <Label htmlFor="private">Make private</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsCreatingChannel(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Channel</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {showChannels && (
              <div id="channels-list" className="space-y-1 mt-1">
                {channels.map((channel) => {
                  const isActive = activeChannel?.id === channel.id

                  return (
                    <Button
                      key={channel.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-2 text-sm font-normal",
                        isActive
                          ? "bg-swift-primary/20 text-white"
                          : "text-gray-300 hover:text-white hover:bg-swift-accent/20",
                      )}
                      onClick={() => navigateToChannel(channel.id)}
                      disabled={isNavigating}
                    >
                      {channel.isPrivate ? (
                        <Lock className="mr-2 h-4 w-4 flex-shrink-0" />
                      ) : (
                        <Hash className="mr-2 h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="truncate">{channel.name}</span>
                      {channel.isPrivate && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Private
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <div
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer"
              onClick={() => setShowDirectMessages(!showDirectMessages)}
              role="button"
              tabIndex={0}
              aria-expanded={showDirectMessages}
              aria-controls="dm-list"
            >
              <div className="flex items-center gap-1 text-sm font-semibold text-gray-300">
                <ChevronDown className={`h-4 w-4 transition-transform ${showDirectMessages ? "" : "-rotate-90"}`} />
                <span>Direct Messages</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-gray-300 hover:text-white hover:bg-swift-accent/20"
                title="Add Direct Message"
                aria-label="Add Direct Message"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {showDirectMessages && (
              <div id="dm-list" className="space-y-1 mt-1">
                {otherUsers.map((user) => {
                  // Check if this user is part of the active DM
                  const isActive =
                    activeDirectMessage?.participants.includes(user.id) &&
                    activeDirectMessage.participants.includes(currentUser?.id || "")

                  return (
                    <Button
                      key={user.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-2 text-sm font-normal",
                        isActive
                          ? "bg-swift-primary/20 text-white"
                          : "text-gray-300 hover:text-white hover:bg-swift-accent/20",
                      )}
                      onClick={() => navigateToDirectMessage(user.id)}
                      disabled={isNavigating}
                    >
                      <div className="relative mr-2 flex-shrink-0">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={user.avatar || "/placeholder-avatar.png"}
                            alt={user.displayName || user.email}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.displayName || user.email)}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
                        )}
                      </div>
                      <span className="truncate">{user.displayName || user.email}</span>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-swift-accent/20 p-2">
        <div className="flex items-center justify-between rounded-md px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={currentUser?.avatar || "/placeholder-avatar.png"}
                alt={currentUser?.displayName || currentUser?.email || "User"}
              />
              <AvatarFallback>{getInitials(currentUser?.displayName || currentUser?.email)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate max-w-[140px] text-white">
              {currentUser?.displayName || currentUser?.email || "User"}
            </span>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-white hover:bg-swift-accent/20"
              onClick={navigateToProfile}
              disabled={isNavigating}
            >
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-white hover:bg-swift-accent/20"
              onClick={navigateToSettings}
              disabled={isNavigating}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-300 hover:text-white hover:bg-swift-accent/20"
              onClick={handleLogout}
              disabled={isNavigating}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Log out</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
