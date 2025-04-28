"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/src/services/supabase/client"
import { useAuth } from "@/src/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Circle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/src/lib/utils/date-utils"
import type { User, DirectMessage } from "@/src/lib/types"

/**
 * DirectMessagePage - Component for displaying a direct message conversation
 * Shows user details, message history, and send message form
 */
export function DirectMessagePage() {
  const { user: currentUser } = useAuth()
  const params = useParams<{ id: string }>()
  const recipientId = params?.id

  const [recipient, setRecipient] = useState<User | null>(null)
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch recipient user
  useEffect(() => {
    if (!recipientId) {
      setError("Recipient ID is missing")
      setLoading(false)
      return
    }

    async function fetchRecipient() {
      if (!supabase) {
        setError("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", recipientId).single()

        if (error) {
          throw error
        }

        setRecipient(data as User)
      } catch (err) {
        console.error("Error fetching recipient:", err)
        setError("Failed to load user. Please try again.")
      }
    }

    fetchRecipient()
  }, [recipientId])

  // Fetch messages
  useEffect(() => {
    if (!recipientId || !currentUser) {
      return
    }

    async function fetchMessages() {
      if (!supabase) {
        setError("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        // Fetch messages where current user is sender OR recipient, and the other user is recipient OR sender
        const { data, error } = await supabase
          .from("direct_messages")
          .select("*")
          .or(
            `and(sender_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUser.id})`,
          )
          .order("created_at", { ascending: true })

        if (error) {
          throw error
        }

        setMessages(data as DirectMessage[])
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError("Failed to load messages. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    if (supabase && currentUser) {
      const subscription = supabase
        .channel(`direct_messages:${currentUser.id}_${recipientId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `or(and(sender_id.eq.${currentUser.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUser.id}))`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as DirectMessage])
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [recipientId, currentUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !currentUser || !recipientId || !supabase) {
      return
    }

    setSending(true)

    try {
      const { error } = await supabase.from("direct_messages").insert({
        content: newMessage,
        sender_id: currentUser.id,
        recipient_id: recipientId,
        is_edited: false,
        is_read: false,
      })

      if (error) {
        throw error
      }

      // Clear the input on success
      setNewMessage("")
    } catch (err) {
      console.error("Error sending message:", err)
      // Could add a toast notification here
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  if (loading) {
    return <DirectMessageSkeleton />
  }

  if (error || !recipient) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "User not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="border-b rounded-none">
        <CardHeader className="py-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={recipient.avatar_url || undefined} alt={recipient.username} />
              <AvatarFallback>{recipient.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{recipient.username}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Circle
                    className={`mr-1 h-2 w-2 ${
                      recipient.status === "online" ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                    }`}
                  />
                  {recipient.status === "online" ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <DirectMessageItem
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === currentUser?.id}
                recipient={recipient}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <CardContent className="p-4 border-t">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${recipient.username}`}
              className="min-h-[60px] resize-none"
              disabled={sending}
            />
            <Button type="submit" disabled={!newMessage.trim() || sending}>
              Send
            </Button>
          </div>
        </form>
      </CardContent>
    </div>
  )
}

interface DirectMessageItemProps {
  message: DirectMessage
  isCurrentUser: boolean
  recipient: User
}

function DirectMessageItem({ message, isCurrentUser, recipient }: DirectMessageItemProps) {
  return (
    <div className={`flex items-start gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}>
      <Avatar>
        <AvatarImage
          src={isCurrentUser ? undefined : recipient.avatar_url || undefined}
          alt={isCurrentUser ? "You" : recipient.username}
        />
        <AvatarFallback>{isCurrentUser ? "You" : recipient.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div
        className={`bg-${isCurrentUser ? "primary" : "muted"} p-3 rounded-lg max-w-[80%] ${isCurrentUser ? "text-primary-foreground" : ""}`}
      >
        <p>{message.content}</p>
        <div className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {formatRelativeTime(new Date(message.created_at))}
        </div>
      </div>
    </div>
  )
}

function DirectMessageSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <Card className="border-b rounded-none">
        <CardHeader className="py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`flex items-start gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className={`h-16 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-lg`} />
          </div>
        ))}
      </div>

      <CardContent className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Skeleton className="h-[60px] w-full rounded-md" />
          <Skeleton className="h-10 w-16 rounded-md" />
        </div>
      </CardContent>
    </div>
  )
}
