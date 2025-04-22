"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import ChatHeader from "@/components/chat-header"
import MessageList from "@/components/message-list"
import MessageInput from "@/components/message-input"
import { useWebSocket } from "@/lib/websocket"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type Message = {
  id: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: number
}

type UserDetails = {
  id: string
  name: string
  avatar?: string
}

export default function DirectMessagePage() {
  const { userId: otherUserId } = useParams() as { userId: string }
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<UserDetails | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current user ID from cookie
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(";").shift()
    }

    const id = getCookie("userId")
    if (id) setCurrentUserId(id)
  }, [])

  // Set up WebSocket connection or polling
  const { isConnected, messages: wsMessages, sendMessage, connectionError, isPolling } = useWebSocket(currentUserId)

  // Process WebSocket messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      const lastMessage = wsMessages[wsMessages.length - 1]

      if (lastMessage.type === "direct_message") {
        const { senderId, receiverId } = lastMessage.payload

        if (
          (senderId === currentUserId && receiverId === otherUserId) ||
          (senderId === otherUserId && receiverId === currentUserId)
        ) {
          setMessages((prev) => [
            ...prev,
            {
              id: lastMessage.payload.id,
              content: lastMessage.payload.content,
              sender: {
                id: lastMessage.payload.senderId,
                name: lastMessage.payload.senderName,
              },
              timestamp: lastMessage.payload.timestamp,
            },
          ])
        }
      }
    }
  }, [wsMessages, currentUserId, otherUserId])

  // Fetch user details and messages
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch other user details
      const userResponse = await fetch(`/api/users/${otherUserId}`)
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`)
      }

      const userData = await userResponse.json()
      setOtherUser({
        id: otherUserId,
        name: userData.user.name,
        avatar: userData.user.avatar,
      })

      // Fetch messages
      const messagesResponse = await fetch(`/api/direct-messages/${otherUserId}/messages`)
      if (!messagesResponse.ok) {
        throw new Error(`Failed to fetch messages: ${messagesResponse.status} ${messagesResponse.statusText}`)
      }

      const messagesData = await messagesResponse.json()
      setMessages(messagesData.messages)
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(`Failed to load conversation: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [otherUserId])

  useEffect(() => {
    if (otherUserId && currentUserId) {
      fetchData()
    }
  }, [otherUserId, currentUserId, fetchData])

  // Set up manual refresh for polling mode
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null

    // If we're in polling mode and not already loading, set up a refresh interval
    if (isPolling && !isLoading) {
      refreshInterval = setInterval(() => {
        fetchData()
      }, 10000) // Refresh every 10 seconds as a backup to the polling in useWebSocket
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [isPolling, isLoading, fetchData])

  const handleSendMessage = async (content: string) => {
    try {
      // Always send message via API
      const response = await fetch(`/api/direct-messages/${otherUserId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // If WebSocket is not connected, manually add the message to the UI
      if (!isConnected) {
        const messageData = await response.json()

        // If the API returned the created message, use it
        if (messageData.message) {
          setMessages((prev) => [...prev, messageData.message])
        } else {
          // Otherwise create a temporary message
          const newMessage = {
            id: `temp-${Date.now()}`,
            content,
            sender: {
              id: currentUserId,
              name: "You", // This will be replaced when we refresh messages
              avatar: undefined,
            },
            timestamp: Date.now(),
          }

          setMessages((prev) => [...prev, newMessage])

          // Refresh messages to get the actual message from the server
          setTimeout(() => {
            fetchData()
          }, 1000)
        }
      }
      // If WebSocket is connected, the message will be added via WebSocket
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
    }
  }

  if (!otherUser && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {otherUser && <ChatHeader name={otherUser.name} type="direct" members={[otherUser]} />}

      {error && (
        <Alert variant="destructive" className="m-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button variant="outline" size="sm" className="ml-auto" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      )}

      {connectionError && (
        <Alert
          variant="warning"
          className="m-2 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput
        onSendMessage={handleSendMessage}
        isDisabled={isLoading}
        placeholder={
          isConnected
            ? `Message ${otherUser?.name}`
            : isPolling
              ? `Message ${otherUser?.name} (polling mode)`
              : "Connecting..."
        }
      />
    </div>
  )
}
