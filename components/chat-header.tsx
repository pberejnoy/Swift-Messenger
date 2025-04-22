"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InfoIcon, Phone, Video, Search, Users } from "lucide-react"
import { getInitials } from "@/lib/string-utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

type ChatHeaderProps = {
  name: string
  type: "channel" | "direct"
  description?: string
  members?: Array<{
    id: string
    name?: string
    displayName?: string
    email?: string
    avatar?: string
    status?: string
    isOnline?: boolean
  }>
  onShowInfo?: () => void
  isMobile?: boolean
}

export default function ChatHeader({ name, type, description, members, onShowInfo, isMobile }: ChatHeaderProps) {
  const [showMembersDrawer, setShowMembersDrawer] = useState(false)

  // Get the first member for direct messages
  const member = type === "direct" && members && members.length > 0 ? members[0] : null

  // Determine status for direct messages
  const status = member?.status || (member?.isOnline ? "online" : "offline")

  // Get status color
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-400"
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
      case "dnd":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  // Format member count text
  const getMemberCountText = () => {
    if (!members) return ""
    const count = members.length
    return `${count} ${count === 1 ? "member" : "members"}`
  }

  return (
    <div className="px-4 py-3 border-b flex items-center justify-between bg-background sticky top-0 z-10">
      <div className="flex items-center">
        {type === "direct" && member && (
          <div className="relative mr-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={member.avatar || "/placeholder.svg"}
                alt={member.displayName || member.name || member.email || "User"}
              />
              <AvatarFallback>{getInitials(member.displayName || member.name || member.email || "")}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${getStatusColor(status)}`}
            />
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold flex items-center">
            {type === "channel" && <span className="text-gray-500 mr-1">#</span>}
            {name}
            {type === "direct" && status && (
              <Badge variant="outline" className="ml-2 text-xs font-normal">
                {status}
              </Badge>
            )}
          </h2>
          {description && <p className="text-sm text-gray-500 truncate max-w-md">{description}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {type === "direct" && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Phone className="h-5 w-5" />
                    <span className="sr-only">Call</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Video className="h-5 w-5" />
                    <span className="sr-only">Video</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        {type === "channel" && (
          <Drawer open={showMembersDrawer} onOpenChange={setShowMembersDrawer}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="flex">
                <Users className="h-5 w-5" />
                <span className="sr-only">Members</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Channel Members</DrawerTitle>
                <DrawerDescription>{getMemberCountText()}</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {members &&
                  members.map((member) => (
                    <div key={member.id} className="flex items-center py-2 border-b">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage
                          src={member.avatar || "/placeholder.svg"}
                          alt={member.displayName || member.name || member.email || "User"}
                        />
                        <AvatarFallback>
                          {getInitials(member.displayName || member.name || member.email || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.displayName || member.name || member.email || "User"}</p>
                        {member.status && <p className="text-xs text-gray-500">{member.status}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </DrawerContent>
          </Drawer>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className={isMobile ? "hidden" : "flex"}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onShowInfo}>
                <InfoIcon className="h-5 w-5" />
                <span className="sr-only">Info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Channel Info</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
