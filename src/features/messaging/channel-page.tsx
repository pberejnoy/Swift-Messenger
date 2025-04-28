"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/src/services/supabase/client"
import { MessageList } from "./message-list"
import { SendMessageForm } from "./send-message-form"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Channel } from "@/src/lib/types"

/**
 * ChannelPage - Component for displaying a messaging channel
 * Shows channel details, message list, and send message form
 */
export function ChannelPage() {
  const params = useParams<{ id: string }>()
  const channelId = params?.id

  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!channelId) {
      setError("Channel ID is missing")
      setLoading(false)
      return
    }

    async function fetchChannel() {
      if (!supabase) {
        setError("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from("channels").select("*").eq("id", channelId).single()

        if (error) {
          throw error
        }

        setChannel(data as Channel)
      } catch (err) {
        console.error("Error fetching channel:", err)
        setError("Failed to load channel. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchChannel()
  }, [channelId])

  if (loading) {
    return <ChannelSkeleton />
  }

  if (error || !channel) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Channel not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="border-b rounded-none">
        <CardHeader className="py-4">
          <CardTitle className="text-xl"># {channel.name}</CardTitle>
          {channel.description && <p className="text-sm text-muted-foreground">{channel.description}</p>}
        </CardHeader>
      </Card>

      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList channelId={channel.id} />
        <SendMessageForm channelId={channel.id} />
      </div>
    </div>
  )
}

function ChannelSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <Card className="border-b rounded-none">
        <CardHeader className="py-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
      </Card>

      <div className="flex-1 p-4 space-y-4">
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
    </div>
  )
}
