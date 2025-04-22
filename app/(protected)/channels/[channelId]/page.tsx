"use client"

import { useEffect, useState, useCallback } from "react"
import { useMessaging } from "@/contexts/messaging-context"
import { useAuth } from "@/contexts/auth-context"
import { useParams, useRouter } from "next/navigation"
import MessageInput from "@/components/message-input"
import ChatHeader from "@/components/chat-header"
import MessageList from "@/components/message-list"
import LoadingScreen from "@/components/loading-screen"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ChannelPage() {
  const { channelId } = useParams() as { channelId: string }
  const { setActiveChannel, activeChannel, isLoadingMessages, channels, addMessageReaction } = useMessaging()
  const { currentUser, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof channelId === "string") {
      try {
        // Check if the channel exists in our channels list
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
  }, [channelId, channels, setActiveChannel, router])

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

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/channels/general">Go to General Channel</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading channel...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader name={activeChannel.name || "Channel"} type="channel" description={activeChannel.description} />
      <MessageList handleAddReaction={handleAddReaction} />
      <MessageInput />
    </div>
  )
}
