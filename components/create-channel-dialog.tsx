"use client"

import type React from "react"

import { useState } from "react"
import { useMessaging } from "@/contexts/messaging-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

interface CreateChannelDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateChannelDialog({ isOpen, onClose }: CreateChannelDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { createChannel } = useMessaging()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const channel = await createChannel(name, description, isPrivate)
      router.push(`/channels/${channel.id}`)
      onClose()
      setName("")
      setDescription("")
      setIsPrivate(false)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-swift-accent dark:text-white">Create a new channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Channel name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. marketing"
                required
                className="border-swift-primary/20 focus-visible:ring-swift-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this channel about?"
                className="border-swift-primary/20 focus-visible:ring-swift-primary"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
              <Label htmlFor="private">Make private</Label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-swift-primary/20 text-swift-primary hover:bg-swift-primary/10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-swift-primary hover:bg-swift-primary/90">
              {isLoading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
