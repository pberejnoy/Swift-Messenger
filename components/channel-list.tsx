"use client"

import { useMessaging } from "@/contexts/messaging-context"
import type { Channel } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Hash, Plus, Lock, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ChannelListProps {
  onCreateChannel: () => void
}

export default function ChannelList({ onCreateChannel }: ChannelListProps) {
  const { channels, activeChannel, setActiveChannel, users } = useMessaging()
  const [showChannels, setShowChannels] = useState(true)
  const [showDirectMessages, setShowDirectMessages] = useState(true)

  // Group channels by public/private
  const publicChannels = channels.filter((channel) => !channel.isPrivate)
  const privateChannels = channels.filter((channel) => channel.isPrivate)

  return (
    <div className="py-4">
      {/* Channels section */}
      <div className="px-4 mb-2">
        <button
          className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white"
          onClick={() => setShowChannels(!showChannels)}
        >
          <span>Channels ({publicChannels.length + privateChannels.length})</span>
          {showChannels ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {showChannels && (
        <div className="mb-4">
          {channels.length === 0 ? (
            <div className="px-4 py-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
          ) : (
            <>
              {publicChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                />
              ))}

              {privateChannels.length > 0 && (
                <div className="mt-2 mb-1 px-4">
                  <div className="text-xs font-medium text-gray-500">Private</div>
                </div>
              )}

              {privateChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                />
              ))}
            </>
          )}

          <div className="px-4 mt-2">
            <button onClick={onCreateChannel} className="flex items-center text-sm text-gray-400 hover:text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Channel
            </button>
          </div>
        </div>
      )}

      {/* Direct Messages section */}
      <div className="px-4 mb-2 mt-4">
        <button
          className="flex items-center justify-between w-full text-sm font-bold uppercase tracking-wider text-gray-400 hover:text-white"
          onClick={() => setShowDirectMessages(!showDirectMessages)}
        >
          <span>Direct Messages</span>
          {showDirectMessages ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {showDirectMessages && (
        <div>
          {users.length === 0 ? (
            <div className="px-4 py-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
          ) : (
            users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center px-4 py-1 text-gray-300 hover:bg-gray-700 cursor-pointer">
                <div
                  className={`h-2 w-2 rounded-full mr-2 ${
                    user.status === "online" ? "bg-green-500" : user.status === "away" ? "bg-yellow-500" : "bg-gray-500"
                  }`}
                />
                <span className="truncate">{user.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface ChannelItemProps {
  channel: Channel
  isActive: boolean
  onClick: () => void
}

function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-4 py-1 text-left text-sm",
        isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700",
      )}
    >
      {channel.isPrivate ? (
        <Lock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
      ) : (
        <Hash className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
      )}
      <span className="truncate">{channel.name}</span>
    </button>
  )
}
