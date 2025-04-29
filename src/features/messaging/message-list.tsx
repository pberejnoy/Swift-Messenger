"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchMessagesByChannel, subscribeToChannelMessages } from "@/src/services/messaging-service/messaging-service"
import { formatRelativeTime } from "@/src/lib/date-utils"
import type { Message } from "@/src/lib/types/supabase-types"

interface MessageListProps {
  channelId: string
}

export function MessageList({ channelId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true)
        const data = await fetchMessagesByChannel(channelId)
        setMessages(data)
        setError(null)
      } catch (err) {
        setError("Failed to load messages. Please try again.")
        console.error("Error loading messages:", err)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()

    // Subscribe to new messages
    const unsubscribe = subscribeToChannelMessages(channelId, (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage])
    })

    return () => {
      unsubscribe()
    }
  }, [channelId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground">
        <div>
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Be the first to send a message in this channel!</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-15rem)]" ref={scrollAreaRef}>
      <div className="flex flex-col space-y-4 p-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </ScrollArea>
  )
}

interface MessageItemProps {
  message: Message
}

function MessageItem({ message }: MessageItemProps) {
  // @ts-ignore - users is added by the join in fetchMessagesByChannel
  const username = message.users?.username || "Unknown User"
  // @ts-ignore - users is added by the join in fetchMessagesByChannel
  const avatarUrl = message.users?.avatar_url

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={avatarUrl || ""} alt={username} />
        <AvatarFallback>{getInitials(username)}</AvatarFallback>
      </Avatar>
      <div className="space-y-1 flex-1">
        <div className="flex items-center">
          <span className="font-medium">{username}</span>
          <span className="ml-2 text-xs text-muted-foreground">{formatRelativeTime(message.created_at)}</span>
          {message.is_edited && <span className="ml-2 text-xs text-muted-foreground">(edited)</span>}
        </div>
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  )
}
