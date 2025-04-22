"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, PaperclipIcon, Smile } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>
  isDisabled?: boolean
  placeholder?: string
  showAttachmentOptions?: boolean
}

export default function MessageInput({
  onSendMessage,
  isDisabled = false,
  placeholder = "Type a message...",
  showAttachmentOptions = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Common emoji reactions
  const commonEmojis = ["👍", "❤️", "😂", "😮", "👏", "🎉", "👀", "🙌"]

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return
    if (isSending) return

    setIsSending(true)
    try {
      await onSendMessage(message, attachments.length > 0 ? attachments : undefined)
      setMessage("")
      setAttachments([])
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleAddEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="border-t p-4 bg-background">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
              <span className="truncate max-w-[100px]">{file.name}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setAttachments([])}
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 rounded-md border overflow-hidden focus-within:ring-1 focus-within:ring-ring">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "min-h-[40px] max-h-[200px] resize-none border-0 focus-visible:ring-0 p-2",
              isSending && "opacity-50",
            )}
            disabled={isDisabled || isSending}
          />
        </div>

        <div className="flex gap-1">
          {showAttachmentOptions && (
            <>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled || isSending}
                className="h-10 w-10"
              >
                <PaperclipIcon className="h-5 w-5" />
                <span className="sr-only">Attach files</span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isDisabled || isSending}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={isDisabled || isSending}
                    className="h-10 w-10"
                  >
                    <Smile className="h-5 w-5" />
                    <span className="sr-only">Add emoji</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="end">
                  <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {commonEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
                        onClick={() => handleAddEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}

          <Button
            type="button"
            size="icon"
            onClick={handleSendMessage}
            disabled={(!message.trim() && attachments.length === 0) || isDisabled || isSending}
            className="h-10 w-10"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
