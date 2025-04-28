"use client"

import type React from "react"

import { useState, useRef } from "react"
import { supabase } from "@/src/services/supabase/client"
import { useAuth } from "@/src/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface SendMessageFormProps {
  channelId: string
}

/**
 * SendMessageForm - Component for sending messages in a channel
 * Includes optimistic UI updates
 */
export function SendMessageForm({ channelId }: SendMessageFormProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !user || !supabase) {
      return
    }

    setSending(true)

    try {
      const { error } = await supabase.from("messages").insert({
        content: message,
        channel_id: channelId,
        user_id: user.id,
        is_edited: false,
      })

      if (error) {
        throw error
      }

      // Clear the input on success
      setMessage("")
      textareaRef.current?.focus()
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
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={!message.trim() || sending}>
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for a new line</p>
    </form>
  )
}
