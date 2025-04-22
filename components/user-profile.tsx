"use client"

import { useMessenger } from "@/contexts/messenger-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface UserProfileProps {
  userId: string
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { state } = useMessenger()
  const user = state.users[userId]

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={user.status === "online" ? "default" : "secondary"}>
              {user.status === "online" ? "Online" : user.status === "away" ? "Away" : "Offline"}
            </Badge>
            {user.lastActive && user.status !== "online" && (
              <span className="text-sm text-muted-foreground">
                Last active {formatDistanceToNow(user.lastActive, { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Contact Information</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm text-muted-foreground">Email</div>
          <div className="text-sm">{user.email}</div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Channels</h3>
        <div className="flex flex-wrap gap-2">
          {Object.values(state.channels)
            .filter((channel) => channel.members.includes(user.id))
            .map((channel) => (
              <Badge key={channel.id} variant="outline">
                #{channel.name}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  )
}
