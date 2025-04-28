"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/src/services/supabase/client"
import { useAuth } from "@/src/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { formatRelativeTime } from "@/src/lib/utils/date-utils"
import type { Message, User } from "@/src/lib/types"

interface MessageListProps {
  channelId: string
}

/**
 * MessageList - Component for displaying messages in a channel
 * Includes real-time updates using Supabase subscriptions
 */
export function MessageList({ channelId }: MessageListProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<(Message & { user: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      if (!supabase) {
        setError("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("messages")
          .select(`*, user:user_id(*)`)
          .eq("channel_id", channelId)
          .order("created_at", { ascending: true })
          .limit(50)

        if (error) {
          throw error
        }

        // Transform the data to match our expected format
        const formattedMessages = data.map((message) => ({
          ...message,
          user: message.user as unknown as User,
        }))

        setMessages(formattedMessages)
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError("Failed to load messages. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [channelId])

  // Subscribe to new messages
  useEffect(() => {
    if (!supabase) return

    const subscription = supabase
      .channel(`messages:channel_id=eq.${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch the user data for the new message
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", payload.new.user_id)
            .single()

          if (userError) {
            console.error("Error fetching user for new message:", userError)
            return
          }

          const newMessage = {
            ...payload.new,
            user: userData as User,
          } as Message & { user: User }

          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [channelId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No messages yet. Be the first to send a message!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} isCurrentUser={message.user_id === user?.id} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}

interface MessageItemProps {
  message: Message & { user: User }
  isCurrentUser: boolean
}

function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  return (
    <div className={`flex items-start gap-3 ${isCurrentUser ? "opacity-90" : ""}`}>
      <Avatar>
        <AvatarImage src={message.user.avatar_url || undefined} alt={message.user.username} />
        <AvatarFallback>{message.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{message.user.username}</span>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(new Date(message.created_at))}</span>
        </div>
        <p className="mt-1">{message.content}</p>
      </div>
    </div>
  )
}
