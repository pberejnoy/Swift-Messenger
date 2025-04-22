"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMessaging } from "@/contexts/messaging-context"
import { useAuth } from "@/contexts/auth-context"
import ChatHeader from "@/components/chat-header"
import MessageList from "@/components/message-list"
import MessageInput from "@/components/message-input"
import LoadingScreen from "@/components/loading-screen"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function DirectMessagePage() {
  const { userId } = useParams() as { userId: string }
  const router = useRouter()
  const { setActiveDirectMessage, activeDirectMessage, users, isLoadingMessages, messages, addMessageReaction } =
    useMessaging()
  const { currentUser, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)
  const { toast } = useToast()

  // Find the other user
  const otherUser = users.find((user) => user.id === userId)

  // Add the handleAddReaction function to handle reactions in direct messages

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

  useEffect(() => {
    if (userId && !isLoading && currentUser) {
      try {
        // Check if the user exists in our users list
        const userExists = users.some((user) => user.id === userId)

        if (userExists) {
          setActiveDirectMessage(userId)
          setError(null)
        } else {
          console.warn(`User with ID ${userId} not found`)
          setError("User not found. Redirecting to channels...")

          // Redirect to channels after a short delay
          const redirectTimer = setTimeout(() => {
            router.push("/channels/general")
          }, 3000)

          return () => clearTimeout(redirectTimer)
        }
      } catch (err) {
        console.error("Error setting active direct message:", err)
        setError("Error loading conversation. Please try again.")

        // Show toast for better visibility
        toast({
          title: "Error",
          description: "Failed to load conversation. Please try again.",
          variant: "destructive",
        })
      }
    }
  }, [userId, users, setActiveDirectMessage, router, isLoading, currentUser, toast])

  // If the user is trying to message themselves, redirect to channels
  useEffect(() => {
    if (currentUser && userId === currentUser.id && !isLoading) {
      setError("You cannot message yourself. Redirecting to channels...")

      // Show toast for better visibility
      toast({
        title: "Invalid Action",
        description: "You cannot message yourself. Redirecting to channels...",
        variant: "destructive",
      })

      // Redirect to channels after a short delay
      const redirectTimer = setTimeout(() => {
        router.push("/channels/general")
      }, 3000)

      return () => clearTimeout(redirectTimer)
    }
  }, [currentUser, userId, router, isLoading, toast])

  const handleRetry = () => {
    setRetrying(true)
    setError(null)

    // Try to set the active direct message again
    if (userId && currentUser) {
      try {
        setActiveDirectMessage(userId)

        // If there are still no messages after a short delay, show an error
        setTimeout(() => {
          if (messages.length === 0) {
            setError("No messages found. Try sending a message to start the conversation.")
          }
          setRetrying(false)
        }, 1000)
      } catch (error) {
        console.error("Error retrying direct message setup:", error)
        setError("Failed to load conversation. Please try again.")
        setRetrying(false)

        // Show toast for better visibility
        toast({
          title: "Error",
          description: "Failed to reload conversation. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      setRetrying(false)
    }
  }

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
          {error.includes("No messages found") ? (
            <div className="flex justify-center space-x-4">
              <Button onClick={handleRetry} disabled={retrying}>
                {retrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/channels/general">Go to Channels</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!otherUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        name={otherUser.displayName || otherUser.email || otherUser.name || "User"}
        type="direct"
        members={[otherUser]}
      />
      <MessageList messages={messages} isLoading={isLoadingMessages} onReactionClick={handleAddReaction} />
      <MessageInput placeholder={`Message ${otherUser.displayName || otherUser.name || "User"}`} />
    </div>
  )
}
