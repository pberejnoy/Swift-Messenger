"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useMessaging } from "@/contexts/messaging-context"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, MoreHorizontal, Edit, Trash2, RefreshCcw, Smile } from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface MessageListProps {
  messages?: any[]
  isLoading?: boolean
  channelName?: string
  // Important: Set this to false by default to avoid duplicate headers
  showChannelHeader?: boolean
  onReplyClick?: (messageId: string) => void
  onReactionClick?: (messageId: string, reaction: string) => Promise<void>
}

export default function MessageList({
  messages = [],
  isLoading = false,
  channelName,
  // Default to false to avoid duplication with the main header
  showChannelHeader = false,
  onReplyClick,
  onReactionClick,
}: MessageListProps) {
  const { currentUser } = useAuth()
  const { users, setActiveThread } = useMessaging()
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Common emoji reactions
  const commonEmojis = ["👍", "❤️", "😂", "😮", "👏", "🎉", "👀", "🙌"]

  // Handle scroll to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

    if (isNearBottom !== autoScroll) {
      setAutoScroll(isNearBottom)
    }
  }, [autoScroll])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return []

    const groups: {
      date: number
      dateLabel: string
      messages: {
        userId: string
        messages: any[]
      }[]
    }[] = []

    // Sort messages by date
    const sortedMessages = [...messages].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))

    sortedMessages.forEach((message) => {
      if (!message) return

      const messageDate = new Date(message.createdAt || Date.now())
      const dateMidnight = new Date(messageDate).setHours(0, 0, 0, 0)

      // Format the date
      let dateLabel = ""
      if (isToday(messageDate)) {
        dateLabel = "Today"
      } else if (isYesterday(messageDate)) {
        dateLabel = "Yesterday"
      } else {
        dateLabel = format(messageDate, "MMMM d, yyyy")
      }

      // Find or create date group
      let dateGroup = groups.find((g) => g.date === dateMidnight)
      if (!dateGroup) {
        dateGroup = {
          date: dateMidnight,
          dateLabel,
          messages: [],
        }
        groups.push(dateGroup)
      }

      // Find or create user group within date group
      let userGroup = dateGroup.messages.find((g) => g.userId === message.userId)
      if (
        !userGroup ||
        (dateGroup.messages.length > 0 &&
          message.createdAt -
            dateGroup.messages[dateGroup.messages.length - 1].messages[dateGroup.messages.length - 1].createdAt >
            5 * 60 * 1000)
      ) {
        userGroup = {
          userId: message.userId,
          messages: [],
        }
        dateGroup.messages.push(userGroup)
      }

      userGroup.messages.push(message)
    })

    // Sort date groups by date
    return groups.sort((a, b) => a.date - b.date)
  }, [messages])

  const handleRetry = useCallback(async () => {
    setIsRetrying(true)
    try {
      // Implement retry logic here
      setError(null)
    } catch (error) {
      setError("Failed to load messages. Please try again.")
    } finally {
      setIsRetrying(false)
    }
  }, [])

  const handleEditMessage = useCallback(async (messageId: string, content: string) => {
    try {
      // Implement edit message logic
      setEditingMessageId(null)
      setEditedContent("")
    } catch (error) {
      console.error("Error editing message:", error)
    }
  }, [])

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return
    }

    try {
      // Implement delete message logic
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }, [])

  const handleReactionClick = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        if (onReactionClick) {
          await onReactionClick(messageId, emoji)
        }
        setShowReactionPicker(null)
      } catch (error) {
        console.error("Error adding reaction:", error)
      }
    },
    [onReactionClick],
  )

  // Function to render message groups by date
  const renderMessageGroups = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 px-4 py-5">
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
        </div>
      )
    }

    if (!messages.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No messages yet</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Be the first to send a message in this {channelName ? `#${channelName}` : ""} channel
          </p>
        </div>
      )
    }

    return groupedMessages.map((dateGroup) => (
      <div key={dateGroup.date} className="mb-6">
        <div className="relative flex items-center py-2 my-6">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">{dateGroup.dateLabel}</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <div className="space-y-6">
          {dateGroup.messages.map((userGroup, groupIndex) => {
            const user = users.find((u) => u.id === userGroup.userId) || {
              id: userGroup.userId,
              name: "Unknown User",
            }

            return (
              <MessageGroup
                key={`${dateGroup.date}-${userGroup.userId}-${groupIndex}`}
                user={user}
                messages={userGroup.messages}
                currentUserId={currentUser?.id}
                onReply={(messageId) => {
                  if (onReplyClick) {
                    onReplyClick(messageId)
                  } else if (setActiveThread) {
                    setActiveThread(messageId)
                  }
                }}
                onEdit={(messageId, content) => {
                  setEditingMessageId(messageId)
                  setEditedContent(content)
                }}
                onSaveEdit={handleEditMessage}
                onCancelEdit={() => setEditingMessageId(null)}
                onDelete={handleDeleteMessage}
                onReaction={handleReactionClick}
                editingMessageId={editingMessageId}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
                showReactionPicker={showReactionPicker}
                setShowReactionPicker={setShowReactionPicker}
                commonEmojis={commonEmojis}
                currentUser={currentUser}
              />
            )
          })}
        </div>
      </div>
    ))
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Only show channel header if explicitly requested */}
      {showChannelHeader && channelName && (
        <div className="px-4 py-2 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="text-muted-foreground mr-1">#</span>
            {channelName}
          </h2>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={handleRetry} disabled={isRetrying}>
              <RefreshCcw className="h-3.5 w-3.5 mr-1" />
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4" onScroll={handleScroll}>
        {renderMessageGroups()}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

// Message group component
function MessageGroup({
  user,
  messages,
  currentUserId,
  onReply,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onReaction,
  editingMessageId,
  editedContent,
  setEditedContent,
  showReactionPicker,
  setShowReactionPicker,
  commonEmojis,
  currentUser,
}) {
  const isCurrentUser = user.id === currentUserId
  const firstMessage = messages[0]

  return (
    <div className="group flex mb-6 last:mb-0">
      <div className="mr-3 flex-shrink-0 mt-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar || "/placeholder-avatar.png"} alt={user.name || "User"} />
          <AvatarFallback>{(user.name?.[0] || "U").toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline">
          <span className="font-medium text-sm mr-2">{user.name || user.email || "Unknown User"}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(firstMessage.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className="space-y-2 mt-1">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              onReply={() => onReply(message.id)}
              onEdit={() => onEdit(message.id, message.content)}
              onDelete={() => onDelete(message.id)}
              onReaction={(emoji) => onReaction(message.id, emoji)}
              isEditing={editingMessageId === message.id}
              editedContent={editingMessageId === message.id ? editedContent : message.content}
              setEditedContent={setEditedContent}
              onSaveEdit={() => onSaveEdit(message.id, editedContent)}
              onCancelEdit={onCancelEdit}
              showReactionPicker={showReactionPicker === message.id}
              setShowReactionPicker={setShowReactionPicker}
              commonEmojis={commonEmojis}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Individual message component
function MessageItem({
  message,
  isCurrentUser,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  isEditing,
  editedContent,
  setEditedContent,
  onSaveEdit,
  onCancelEdit,
  showReactionPicker,
  setShowReactionPicker,
  commonEmojis,
  currentUserId,
}) {
  const { users } = useMessaging()

  if (isEditing) {
    return (
      <div className="py-1">
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[80px] mb-2"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancelEdit}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSaveEdit} disabled={!editedContent.trim()}>
            Save Changes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative py-0.5">
      <div className="relative group">
        <div className="text-sm break-words whitespace-pre-wrap">{message.content}</div>

        {message.isEdited && <span className="text-xs text-muted-foreground ml-1">(edited)</span>}

        {/* Message actions */}
        <div className="absolute -right-1 top-0 hidden group-hover:flex items-center gap-0.5 bg-background/85 backdrop-blur-sm rounded border shadow-sm">
          <Popover
            open={showReactionPicker === message.id}
            onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}
          >
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="end">
              <div className="flex gap-1 flex-wrap max-w-[200px]">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
                    onClick={() => onReaction(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReply}>
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>

          {isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(
            message.reactions.reduce(
              (acc, reaction) => {
                const emoji = reaction.reaction || "👍" // Default to thumbs up if no reaction specified
                if (!acc[emoji]) {
                  acc[emoji] = { count: 0, userIds: [] }
                }
                acc[emoji].count++
                acc[emoji].userIds.push(reaction.userId)
                return acc
              },
              {} as Record<string, { count: number; userIds: string[] }>,
            ),
          ).map(([emoji, data]) => (
            <TooltipProvider key={emoji}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs border",
                      data.userIds.includes(currentUserId)
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-muted/40 border-muted/30 hover:bg-muted",
                    )}
                    onClick={() => onReaction(emoji)}
                  >
                    <span className="mr-1">{emoji}</span>
                    <span>{data.count}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {data.userIds
                    .map((id) => {
                      const user = users.find((u) => u.id === id)
                      return user ? user.displayName || user.name || id : id
                    })
                    .join(", ")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {/* Thread indicator */}
      {message.threadCount > 0 && (
        <button className="flex items-center mt-1 text-xs text-primary hover:underline" onClick={onReply}>
          <MessageSquare className="h-3 w-3 mr-1" />
          {message.threadCount} {message.threadCount === 1 ? "reply" : "replies"}
        </button>
      )}
    </div>
  )
}

// Skeleton loader for messages
function MessageSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
