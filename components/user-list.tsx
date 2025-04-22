"use client"

import { useMessaging } from "@/contexts/messaging-context"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getInitials } from "@/lib/string-utils"

export default function UserList() {
  const { activeChannel, users, isLoadingUsers, startDirectMessage } = useMessaging()
  const { currentUser } = useAuth()

  if (!activeChannel) return null

  // Get all users in the active channel
  const channelUsers = users.filter((user) => activeChannel.members.includes(user.id))

  // Sort users: online first, then away, then offline
  const sortedUsers = [...channelUsers].sort((a, b) => {
    const statusOrder = { online: 0, away: 1, dnd: 2, offline: 3 }
    return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
  })

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold mb-4 text-gray-500">Members ({channelUsers.length})</h2>

      {isLoadingUsers ? (
        <div className="space-y-3">
          <UserSkeleton />
          <UserSkeleton />
          <UserSkeleton />
        </div>
      ) : (
        <div className="space-y-2">
          {sortedUsers.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser?.id}
              onUserClick={startDirectMessage}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function UserSkeleton() {
  return (
    <div className="flex items-center">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-4 w-24 ml-2" />
    </div>
  )
}

interface UserItemProps {
  user: User
  isCurrentUser: boolean
  onUserClick?: (userId: string) => void
}

function UserItem({ user, isCurrentUser, onUserClick }: UserItemProps) {
  const handleClick = () => {
    if (onUserClick && !isCurrentUser) {
      onUserClick(user.id)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              !isCurrentUser ? "cursor-pointer" : "cursor-default",
            )}
            onClick={handleClick}
          >
            <div className="relative">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-gray-900",
                  user.status === "online"
                    ? "bg-green-500"
                    : user.status === "away"
                      ? "bg-yellow-500"
                      : user.status === "dnd"
                        ? "bg-red-500"
                        : "bg-gray-500",
                )}
              />
            </div>
            <div className="ml-2 flex flex-col">
              <span className="text-sm font-medium">
                {user.name} {isCurrentUser && "(you)"}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        {!isCurrentUser && <TooltipContent>Click to message {user.name}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}
