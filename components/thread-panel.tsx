"use client"

import type React from "react"

import { useMessaging } from "@/contexts/messaging-context"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef, useEffect } from "react"
import { Send, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export default function ThreadPanel() {
  const { currentUser } = useAuth()
  const { activeThread, threadMessages, isLoadingThread, sendThreadReply, setActiveThread, state, addMessageReaction } =
    useMessaging()
  const [replyContent, setReplyContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [threadMessages])

  if (!activeThread) return null

  const parentMessage = threadMessages[0]
  if (!parentMessage) return null

  const handleSendReply = async () => {
    if (!replyContent.trim()) return

    setIsSending(true)
    try {
      if (!activeThread) {
        throw new Error("No active thread")
      }

      const reply = await sendThreadReply(activeThread, replyContent)
      if (reply) {
        // The reply will be added to threadMessages via the context
        setReplyContent("")
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Thread</h3>
        <Button variant="ghost" size="icon" onClick={() => setActiveThread(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Thread messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingThread ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <>
            {/* Parent message */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={state.users[parentMessage.userId]?.avatar || "/placeholder.svg"}
                    alt={state.users[parentMessage.userId]?.name || "User"}
                  />
                  <AvatarFallback>{state.users[parentMessage.userId]?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-baseline">
                    <span className="font-bold text-sm mr-2">
                      {state.users[parentMessage.userId]?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">{format(new Date(parentMessage.createdAt), "h:mm a")}</span>
                  </div>
                  <p className="text-sm mt-1">{parentMessage.content}</p>
                </div>
              </div>
            </div>

            {/* Thread replies */}
            <div className="space-y-4 mt-4">
              {threadMessages.slice(1).map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={state.users[message.userId]?.avatar || "/placeholder.svg"}
                      alt={state.users[message.userId]?.name || "User"}
                    />
                    <AvatarFallback>{state.users[message.userId]?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline">
                      <span className="font-bold text-sm mr-2">{state.users[message.userId]?.name || "Unknown"}</span>
                      <span className="text-xs text-gray-500">{format(new Date(message.createdAt), "h:mm a")}</span>
                    </div>
                    <p className="text-sm mt-1">{message.content}</p>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(
                          message.reactions.reduce(
                            (acc, reaction) => {
                              const emoji = reaction.reaction || "👍"
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
                          <button
                            key={emoji}
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs border",
                              data.userIds.includes(currentUser?.id || "")
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-muted/40 border-muted/30 hover:bg-muted",
                            )}
                            onClick={() => addMessageReaction(message.id, emoji)}
                          >
                            <span className="mr-1">{emoji}</span>
                            <span>{data.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* Reply input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Reply in thread..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] resize-none"
          />
          <Button size="icon" onClick={handleSendReply} disabled={!replyContent.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
