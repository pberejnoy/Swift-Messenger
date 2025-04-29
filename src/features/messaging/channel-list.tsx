"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchChannels, subscribeToChannels } from "@/src/services/messaging-service/messaging-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Hash, Plus, Search } from "lucide-react"
import type { Channel } from "@/src/lib/types/supabase-types"

export function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const loadChannels = async () => {
      try {
        setLoading(true)
        const data = await fetchChannels()
        setChannels(data)
        setError(null)
      } catch (err) {
        setError("Failed to load channels. Please try again.")
        console.error("Error loading channels:", err)
      } finally {
        setLoading(false)
      }
    }

    loadChannels()

    // Subscribe to new channels
    const unsubscribe = subscribeToChannels((newChannel) => {
      setChannels((prevChannels) => [newChannel, ...prevChannels])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const filteredChannels = channels.filter((channel) => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleChannelClick = (channelId: string) => {
    // Use direct string path instead of routes object to avoid undefined issues
    router.push(`/channels/${channelId}`)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Channels</CardTitle>
        <CardDescription>Browse and join channels</CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {loading ? (
          <div className="px-4 py-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">{error}</div>
        ) : filteredChannels.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No channels match your search" : "No channels available"}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-15rem)]">
            <div className="p-4 space-y-1">
              {filteredChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => handleChannelClick(channel.id)}
                >
                  <Hash className="mr-2 h-4 w-4" />
                  <span className="truncate">{channel.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="border-t p-4">
        <Button className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Channel
        </Button>
      </CardFooter>
    </Card>
  )
}
