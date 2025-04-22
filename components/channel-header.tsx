"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InfoIcon, Users, Phone, Video, Hash, UserPlus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button as ButtonPrimitive } from "@/components/ui/button"

interface ChannelHeaderProps {
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
  onAddMember?: (email: string) => Promise<void>
  showChannelName?: boolean
}

export default function ChannelHeader({
  name,
  type,
  description,
  members = [],
  onShowInfo,
  onAddMember,
  showChannelName = true,
}: ChannelHeaderProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [showMembersDrawer, setShowMembersDrawer] = useState(false)

  // Get the status color for direct messages
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-400"
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-500"
      case "away":
      case "idle":
        return "bg-yellow-500"
      case "dnd":
      case "busy":
        return "bg-red-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  // Format member count text
  const getMemberCountText = () => {
    const count = members?.length || 0
    return `${count} ${count === 1 ? "member" : "members"}`
  }

  // Handle adding a new member
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    if (!onAddMember) {
      toast({
        title: "Error",
        description: "Unable to add member at this time",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await onAddMember(newMemberEmail)
      toast({
        title: "Success",
        description: `Invitation sent to ${newMemberEmail}`,
      })
      setNewMemberEmail("")
      setIsAddingMember(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 h-14">
      <div className="flex items-center min-w-0 flex-1">
        {type === "direct" && members?.[0] && (
          <div className="relative mr-3 flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={members[0].avatar || "/placeholder-avatar.png"}
                alt={members[0].displayName || members[0].name || "User"}
              />
              <AvatarFallback>{members[0]?.displayName?.[0] || members[0]?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            {members[0].status && (
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-background ${getStatusColor(
                  members[0].status,
                )}`}
              />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {showChannelName && (
            <h2 className="text-lg font-semibold flex items-center truncate">
              {type === "channel" && <Hash className="h-5 w-5 mr-1 flex-shrink-0 text-muted-foreground" />}
              <span className="truncate">{name}</span>
              {type === "channel" && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">{getMemberCountText()}</span>
              )}
            </h2>
          )}
          {description && <p className="text-sm text-muted-foreground truncate hidden sm:block">{description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {type === "channel" && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <ButtonPrimitive
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-accent"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span className="sr-only">Add Member</span>
                  </ButtonPrimitive>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Member to #{name}</DialogTitle>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleAddMember()
                      }}
                      className="space-y-4 mt-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          required
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddingMember(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || !newMemberEmail.trim()}>
                          {isLoading ? "Adding..." : "Add Member"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <TooltipContent side="bottom">Add people to #{name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {type === "channel" && (
          <Sheet open={showMembersDrawer} onOpenChange={setShowMembersDrawer}>
            <SheetTrigger asChild>
              <ButtonPrimitive
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">View Members</span>
              </ButtonPrimitive>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Channel Members</SheetTitle>
                <SheetDescription>
                  {getMemberCountText()} in #{name}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-1 max-h-[70vh] overflow-y-auto pr-2">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={member.avatar || "/placeholder-avatar.png"}
                            alt={member.displayName || member.name || member.email || "User"}
                          />
                          <AvatarFallback>
                            {(member.displayName?.[0] || member.name?.[0] || member.email?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {member.status && (
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${getStatusColor(
                              member.status,
                            )}`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {member.displayName || member.name || member.email || "Unknown user"}
                        </p>
                        {member.status && <p className="text-xs text-muted-foreground capitalize">{member.status}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No members found</p>
                )}
              </div>
              <div className="mt-auto pt-4">
                <SheetClose asChild>
                  <Button className="w-full" variant="outline">
                    Close
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {type === "direct" && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-muted-foreground hover:text-primary hover:bg-accent"
                  >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex text-muted-foreground hover:text-primary hover:bg-accent"
                  >
                    <Video className="h-5 w-5" />
                    <span className="sr-only">Video Call</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onShowInfo}
                className="text-muted-foreground hover:text-primary hover:bg-accent"
              >
                <InfoIcon className="h-5 w-5" />
                <span className="sr-only">Channel Info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{type === "channel" ? "Channel Info" : "Conversation Info"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
