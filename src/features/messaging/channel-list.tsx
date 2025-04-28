"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/src/services/supabase/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Hash } from "lucide-react"
import { routes } from "@/src/core/routing/routes"
import type { Channel } from "@/src/lib/types"

/**
 * ChannelList - Component for displaying a list of channels
 * Shows all available channels with active state for current channel
 */
export function ChannelList() {
  const params = useParams<{ id: string }>()
  const currentChannelId = params?.id

  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchChannels() {
      if (!supabase) {
        setError("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from("channels").select("*").order("name", { ascending: true })

        if (error) {
          throw error
        }

        setChannels(data as Channel[])
      } catch (err) {
        console.error("Error fetching channels:", err)
        setError("Failed to load channels")
      } finally {
        setLoading(false)
      }
    }

    fetchChannels()

    // Subscribe to channel changes
    if (supabase) {
      const subscription = supabase
        .channel("channels")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "channels",
          },
          () => {
            // Refetch channels when there's a change
            fetchChannels()
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-2 text-sm text-destructive">{error}</div>
  }

  return (
    <div className="space-y-1 p-2">
      <div className="flex items-center justify-between px-2 py-1.5">
        <h3 className="text-sm font-medium">Channels</h3>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Channel</span>
        </Button>
      </div>

      {channels.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">No channels available</div>
      ) : (
        <div className="space-y-1">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className={`w-full justify-start ${
                channel.id === currentChannelId ? "bg-accent text-accent-foreground" : ""
              }`}
              asChild
            >
              <Link href={`${routes.messages}/${channel.id}`}>
                <Hash className="mr-2 h-4 w-4" />
                {channel.name}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
