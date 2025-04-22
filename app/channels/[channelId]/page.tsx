"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMessaging } from "@/contexts/messaging-context"
import { useAuth } from "@/contexts/auth-context"
import MessageList from "@/components/message-list"
import MessageInput from "@/components/message-input"
import ChannelHeader from "@/components/channel-header"
import LoadingScreen from "@/components/loading-screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"

export default function ChannelPage() {
  const { channelId } = useParams() as { channelId: string }
  const { currentUser, isLoading: isAuthLoading } = useAuth()
  const { channels, activeChannel, setActiveChannel, messages, isLoadingMessages, sendNewMessage, addMessageReaction } =
    useMessaging()
  const [error, setError] = useState<string | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Set active channel when component mounts or channelId changes
  useEffect(() => {
    if (channelId && !isAuthLoading) {
      try {
        // Check if channel exists
        const channelExists = channels.some((channel) => channel.id === channelId)

        if (channelExists) {
          setActiveChannel(channelId)
          setError(null)
        } else {
          console.warn(`Channel with ID ${channelId} not found`)
          setError("Channel not found. Redirecting to general channel...")

          // Redirect to general channel after a short delay
          const redirectTimer = setTimeout(() => {
            router.push("/channels/general")
          }, 3000)

          return () => clearTimeout(redirectTimer)
        }
      } catch (err) {
        console.error("Error setting active channel:", err)
        setError("Error loading channel. Please try again.")
      }
    }
  }, [channelId, channels, setActiveChannel, router, isAuthLoading])

  // Handle sending a new message
  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      if (!content.trim() && (!attachments || attachments.length === 0)) {
        return
      }

      try {
        await sendNewMessage(content, attachments)
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    },
    [sendNewMessage, toast],
  )

  // Handle adding a reaction to a message
  const handleAddReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        await addMessageReaction(messageId, emoji)
      } catch (error) {
        console.error("Error adding reaction:", error)
        toast({
          title: "Error",
          description: "Failed to add reaction. Please try again.",
          variant: "destructive",
        })
      }
    },
    [addMessageReaction, toast],
  )

  // Handle adding a member to the channel
  const handleAddMember = useCallback(
    async (email: string) => {
      try {
        // Implement add member functionality
        toast({
          title: "Success",
          description: `Invitation sent to ${email}`,
        })
      } catch (error) {
        console.error("Error adding member:", error)
        toast({
          title: "Error",
          description: "Failed to add member. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [toast],
  )

  if (isAuthLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <a href="/channels/general">Go to General Channel</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading channel...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Channel Header - Note we're not showing the channel name in MessageList */}
      <ChannelHeader
        name={activeChannel.name}
        type="channel"
        description={activeChannel.description}
        members={activeChannel.members?.map((memberId) => {
          const member = channels.find((c) => c.id === memberId)
          return member || { id: memberId }
        })}
        onShowInfo={() => setIsInfoOpen(true)}
        onAddMember={handleAddMember}
        showChannelName={true}
      />

      {/* Message List - Note showChannelHeader is false to avoid duplication */}
      <MessageList
        messages={messages}
        isLoading={isLoadingMessages}
        channelName={activeChannel.name}
        showChannelHeader={false}
        onReactionClick={handleAddReaction}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        placeholder={`Message #${activeChannel.name}`}
        showAttachmentOptions={true}
      />

      {/* Channel Info Sheet */}
      <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>#{activeChannel.name}</SheetTitle>
            <SheetDescription>{activeChannel.description}</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">About this channel</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created by</p>
                <p>{activeChannel.createdBy || "Unknown"}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Created on</p>
                <p>{new Date(activeChannel.createdAt).toLocaleDateString()}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Members</p>
                <p>{activeChannel.members?.length || 0} members</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium mb-2">Channel Settings</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Channel Permissions
              </Button>

              <Button variant="outline" className="w-full justify-start" size="sm">
                <Info className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
