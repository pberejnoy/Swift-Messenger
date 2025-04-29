"use client"

import { useState, useEffect } from "react"
import { fetchChannelById } from "@/src/services/messaging-service/messaging-service"
import { MessageList } from "./message-list"
import { SendMessageForm } from "./send-message-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Hash } from "lucide-react"
import type { Channel } from "@/src/lib/types/supabase-types"

interface ChannelPageProps {
  channelId: string
}

export function ChannelPage({ channelId }: ChannelPageProps) {
  const [channel, setChannel] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadChannel = async () => {
      try {
        setLoading(true)
        const data = await fetchChannelById(channelId)
        setChannel(data)
        setError(null)
      } catch (err) {
        setError("Failed to load channel. Please try again.")
        console.error("Error loading channel:", err)
      } finally {
        setLoading(false)
      }
    }

    loadChannel()
  }, [channelId])

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        {loading ? (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : channel ? (
          <div className="flex items-center">
            <Hash className="mr-2 h-5 w-5" />
            <h1 className="text-xl font-semibold">{channel.name}</h1>
            {channel.description && <p className="ml-4 text-sm text-muted-foreground">{channel.description}</p>}
          </div>
        ) : (
          <div className="text-muted-foreground">Channel not found</div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {!loading && !error && channel && <MessageList channelId={channelId} />}
      </div>

      {!loading && !error && channel && <SendMessageForm channelId={channelId} />}
    </div>
  )
}
