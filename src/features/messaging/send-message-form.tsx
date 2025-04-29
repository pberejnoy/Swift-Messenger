"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/src/core/auth/auth-provider"
import { sendMessage } from "@/src/services/messaging-service/messaging-service"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PlaneIcon as PaperPlaneIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/src/services/supabase/client"

interface SendMessageFormProps {
  channelId: string
}

export function SendMessageForm({ channelId }: SendMessageFormProps) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userSynced, setUserSynced] = useState(false)
  const { user } = useAuthContext()

  // Check if user exists in the database
  useEffect(() => {
    async function checkUserExists() {
      if (!user) {
        setUserSynced(false)
        return
      }

      try {
        console.log("Checking if user exists in database:", user.id)
        const { data, error } = await supabase.from("users").select("id").eq("id", user.id).single()

        if (error) {
          console.warn("User not found in database:", error)
          setUserSynced(false)
          return
        }

        console.log("User found in database:", data)
        setUserSynced(true)
      } catch (err) {
        console.error("Error checking user in database:", err)
        setUserSynced(false)
      }
    }

    checkUserExists()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || !user || !userSynced) {
      if (!userSynced && user) {
        setError("Your user profile is not yet synchronized. Please refresh the page and try again.")
      }
      return
    }

    try {
      setSending(true)
      setError(null)

      console.log("Attempting to send message with user ID:", user.id)
      await sendMessage(channelId, user.id, content.trim())

      console.log("Message sent successfully")
      setContent("")
    } catch (err) {
      console.error("Error sending message:", err)
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (!sending && content.trim() && user && userSynced) {
        handleSubmit(e)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!userSynced && user && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Your user profile is still synchronizing. You may need to refresh the page before sending messages.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-end space-x-2">
        <Textarea
          placeholder="Type your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] flex-1 resize-none"
          disabled={sending || !userSynced}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!content.trim() || sending || !user || !userSynced}
          title={!userSynced ? "User profile not synchronized yet" : "Send message"}
        >
          <PaperPlaneIcon className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  )
}
