"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { mockDataService } from "@/lib/mock-data-service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { MockMessage, MockChannel, MockUser } from "@/lib/mock-data-service"

type MessagingContextType = {
  users: MockUser[]
  channels: MockChannel[]
  activeChannel: MockChannel | null
  activeDirectMessage: { id: string; participants: string[] } | null
  messages: MockMessage[]
  isLoadingMessages: boolean
  activeThread: string | null
  threadMessages: MockMessage[]
  isLoadingThread: boolean
  searchResults: MockMessage[] | null
  isSearching: boolean
  searchQuery: string
  setActiveChannel: (channelId: string | null) => void
  setActiveDirectMessage: (userId: string | null) => void
  setActiveThread: (messageId: string | null) => void
  sendMessage: (content: string, channelId?: string, dmUserId?: string) => Promise<MockMessage | null>
  createChannel: (name: string, description: string, isPrivate: boolean) => Promise<MockChannel | null>
  addMessageReaction: (messageId: string, reaction: string) => Promise<void>
  sendThreadReply: (parentMessageId: string, content: string) => Promise<MockMessage | null>
  sendNewMessage: (content: string, files?: File[]) => Promise<void>
  editMessage: (messageId: string, content: string) => void
  removeMessage: (messageId: string) => void
  startDirectMessage: (userId: string) => void
  searchMessages: (query: string) => Promise<void>
  clearSearch: () => void
  addUserToChannel: (channelId: string, userId: string) => Promise<boolean>
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined)

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [users, setUsers] = useState<MockUser[]>([])
  const [channels, setChannels] = useState<MockChannel[]>([])
  const [activeChannel, setActiveChannelState] = useState<MockChannel | null>(null)
  const [activeDirectMessage, setActiveDirectMessageState] = useState<{ id: string; participants: string[] } | null>(
    null,
  )
  const [messages, setMessages] = useState<MockMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [activeThread, setActiveThreadState] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<MockMessage[]>([])
  const [isLoadingThread, setIsLoadingThread] = useState(false)
  const [searchResults, setSearchResults] = useState<MockMessage[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load initial data
  useEffect(() => {
    if (!currentUser) return

    // Load users and channels
    setUsers(mockDataService.getUsers())
    setChannels(mockDataService.getChannels())
  }, [currentUser])

  // Set active channel
  const setActiveChannel = useCallback(
    (channelId: string | null) => {
      if (!channelId) {
        setActiveChannelState(null)
        setMessages([])
        return
      }

      setIsLoadingMessages(true)
      const channel = channels.find((c) => c.id === channelId)

      if (channel) {
        setActiveChannelState(channel)

        // Load messages for this channel
        const channelMessages = mockDataService.getChannelMessages(channelId)
        setMessages(channelMessages)
        setIsLoadingMessages(false)
      } else {
        setActiveChannelState(null)
        setMessages([])
        setIsLoadingMessages(false)
      }

      // Clear active direct message when setting active channel
      setActiveDirectMessageState(null)

      // Clear search results
      setSearchResults(null)
      setSearchQuery("")
    },
    [channels],
  )

  // Set active direct message
  const setActiveDirectMessage = useCallback(
    async (userId: string | null) => {
      if (!userId || !currentUser) {
        setActiveDirectMessageState(null)
        setMessages([])
        return
      }

      setIsLoadingMessages(true)

      try {
        // Create or get DM conversation
        const participants = [currentUser.id, userId].sort()
        const dmId = `dm:${participants.join(":")}`

        setActiveDirectMessageState({
          id: dmId,
          participants,
        })

        // Load messages for this DM
        const dmMessages = mockDataService.getDirectMessages(currentUser.id, userId)
        setMessages(dmMessages)
        setIsLoadingMessages(false)
      } catch (error) {
        console.error("Error setting active direct message:", error)
        toast({
          title: "Error",
          description: "Failed to load direct message conversation. Please try again.",
          variant: "destructive",
        })
        setActiveDirectMessageState(null)
        setMessages([])
        setIsLoadingMessages(false)
      }

      // Clear active channel when setting active direct message
      setActiveChannelState(null)

      // Clear search results
      setSearchResults(null)
      setSearchQuery("")
    },
    [currentUser, toast],
  )

  // Function to start a direct message with a user and navigate to the DM
  const startDirectMessage = useCallback(
    (userId: string) => {
      if (!currentUser || userId === currentUser.id) return

      try {
        // Set the active direct message
        setActiveDirectMessage(userId)

        // Navigate to the DM page
        router.push(`/direct-messages/${userId}`)
      } catch (error) {
        console.error("Error starting direct message:", error)
        toast({
          title: "Error",
          description: "Failed to start direct message conversation. Please try again.",
          variant: "destructive",
        })
      }
    },
    [currentUser, router, setActiveDirectMessage, toast],
  )

  const setActiveThread = useCallback(
    (messageId: string | null) => {
      setActiveThreadState(messageId)

      if (messageId) {
        setIsLoadingThread(true)

        // Find the parent message
        const parentMessage = messages.find((msg) => msg.id === messageId)

        if (parentMessage) {
          // In a real app, we would fetch thread messages here
          // For now, we'll just set the parent message as the only thread message
          setThreadMessages([parentMessage])
        } else {
          setThreadMessages([])
        }

        setIsLoadingThread(false)
      } else {
        setThreadMessages([])
      }
    },
    [messages],
  )

  // Send a message
  const sendMessage = useCallback(
    async (content: string, channelId?: string, dmUserId?: string): Promise<MockMessage | null> => {
      if (!currentUser) throw new Error("User not authenticated")
      if (!content.trim()) throw new Error("Message cannot be empty")

      try {
        let newMessage: MockMessage | null = null

        if (channelId) {
          console.log(`Sending message to channel: ${channelId}`)
          // Send message to channel
          newMessage = mockDataService.addMessage({
            content,
            userId: currentUser.id,
            channelId,
            createdAt: Date.now(),
            reactions: [],
          })

          // Update messages if this is the active channel
          if (activeChannel?.id === channelId) {
            console.log(`Updating messages for active channel: ${channelId}`)
            setMessages((prev) => [...prev, newMessage!])
          }
        } else if (dmUserId) {
          console.log(`Sending message to DM with user: ${dmUserId}`)
          // Create DM ID
          const participants = [currentUser.id, dmUserId].sort()
          const dmId = `dm:${participants.join(":")}`

          // Send message to DM
          newMessage = mockDataService.addMessage({
            content,
            userId: currentUser.id,
            dmId,
            createdAt: Date.now(),
            reactions: [],
          })

          // Update messages if this is the active DM
          if (activeDirectMessage?.id === dmId) {
            console.log(`Updating messages for active DM: ${dmId}`)
            setMessages((prev) => [...prev, newMessage!])
          }
        }

        return newMessage
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
        return null
      }
    },
    [currentUser, activeChannel, activeDirectMessage, toast],
  )

  // Send a new message to the active channel or DM
  const sendNewMessage = useCallback(
    async (content: string, files?: File[]): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated")
      if (!content.trim() && (!files || files.length === 0)) throw new Error("Message cannot be empty")

      try {
        if (activeChannel) {
          console.log(`Sending new message to active channel: ${activeChannel.id}`)
          await sendMessage(content, activeChannel.id)
        } else if (activeDirectMessage) {
          console.log(`Sending new message to active DM: ${activeDirectMessage.id}`)
          const otherUserId = activeDirectMessage.participants.find((id) => id !== currentUser.id)
          if (otherUserId) {
            await sendMessage(content, undefined, otherUserId)
          } else {
            throw new Error("Could not determine the recipient of this message")
          }
        } else {
          throw new Error("No active channel or direct message")
        }

        // Handle file uploads here if needed
        if (files && files.length > 0) {
          console.log("File upload would happen here:", files)
          // In a real implementation, we would upload the files and attach them to the message
        }
      } catch (error) {
        console.error("Error sending message:", error)
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
        throw error
      }
    },
    [activeChannel, activeDirectMessage, currentUser, sendMessage, toast],
  )

  // Create a new channel
  const createChannel = useCallback(
    async (name: string, description: string, isPrivate: boolean): Promise<MockChannel | null> => {
      if (!currentUser) throw new Error("User not authenticated")
      if (!name.trim()) throw new Error("Channel name cannot be empty")

      // Check if channel with same name exists
      if (channels.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Channel with this name already exists")
      }

      try {
        // Create new channel
        const newChannel = mockDataService.addChannel({
          name,
          description,
          isPrivate,
          createdBy: currentUser.id,
          createdAt: Date.now(),
          participants: [currentUser.id],
        })

        // Update channels state
        setChannels((prevChannels) => [...prevChannels, newChannel])

        toast({
          title: "Success",
          description: "Channel created successfully.",
        })

        return newChannel
      } catch (error) {
        console.error("Error creating channel:", error)
        toast({
          title: "Error",
          description: "Failed to create channel. Please try again.",
          variant: "destructive",
        })
        return null
      }
    },
    [currentUser, channels, toast],
  )

  // Add a reaction to a message
  const addMessageReaction = useCallback(
    async (messageId: string, reaction: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated")

      try {
        // Add reaction to message
        mockDataService.addReaction(messageId, currentUser.id, reaction)

        // Update messages state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), { userId: currentUser.id, reaction }],
                }
              : msg,
          ),
        )

        // Update thread messages state if applicable
        setThreadMessages((prevThreadMessages) =>
          prevThreadMessages.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: [...(msg.reactions || []), { userId: currentUser.id, reaction }],
                }
              : msg,
          ),
        )
      } catch (error) {
        console.error("Error adding reaction:", error)
        toast({
          title: "Error",
          description: "Failed to add reaction. Please try again.",
          variant: "destructive",
        })
      }
    },
    [currentUser, toast],
  )

  // Send a reply to a thread
  const sendThreadReply = useCallback(
    async (parentMessageId: string, content: string): Promise<MockMessage | null> => {
      if (!currentUser) throw new Error("User not authenticated")
      if (!content.trim()) throw new Error("Message cannot be empty")

      try {
        // Send reply
        const newMessage = mockDataService.addMessage({
          content,
          userId: currentUser.id,
          channelId: activeChannel?.id, // Assuming thread replies are always in the active channel
          createdAt: Date.now(),
          reactions: [],
          parentMessageId,
        })

        // Update thread messages state
        setThreadMessages((prevThreadMessages) => [...prevThreadMessages, newMessage])

        return newMessage
      } catch (error) {
        console.error("Error sending thread reply:", error)
        toast({
          title: "Error",
          description: "Failed to send thread reply. Please try again.",
          variant: "destructive",
        })
        return null
      }
    },
    [currentUser, activeChannel, toast],
  )

  // Edit a message
  const editMessage = useCallback(
    async (messageId: string, content: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated")
      if (!content.trim()) throw new Error("Message cannot be empty")

      try {
        // Edit message
        mockDataService.editMessage(messageId, content)

        // Update messages state
        setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)))

        // Update thread messages state if applicable
        setThreadMessages((prevThreadMessages) =>
          prevThreadMessages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)),
        )
      } catch (error) {
        console.error("Error editing message:", error)
        toast({
          title: "Error",
          description: "Failed to edit message. Please try again.",
          variant: "destructive",
        })
      }
    },
    [currentUser, toast],
  )

  // Remove a message
  const removeMessage = useCallback(
    async (messageId: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated")

      try {
        // Remove message
        mockDataService.removeMessage(messageId)

        // Update messages state
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId))

        // Update thread messages state if applicable
        setThreadMessages((prevThreadMessages) => prevThreadMessages.filter((msg) => msg.id !== messageId))

        // Clear active thread if the removed message was the active thread
        if (activeThread === messageId) {
          setActiveThread(null)
        }
      } catch (error) {
        console.error("Error removing message:", error)
        toast({
          title: "Error",
          description: "Failed to remove message. Please try again.",
          variant: "destructive",
        })
      }
    },
    [currentUser, activeThread, setActiveThread, toast],
  )

  // Search messages
  const searchMessages = useCallback(
    async (query: string): Promise<void> => {
      if (!query.trim()) {
        setSearchResults(null)
        setIsSearching(false)
        setSearchQuery("")
        return
      }

      setIsSearching(true)
      setSearchQuery(query)

      try {
        // Search messages
        const results = mockDataService.searchMessages(query)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching messages:", error)
        toast({
          title: "Error",
          description: "Failed to search messages. Please try again.",
          variant: "destructive",
        })
        setSearchResults(null)
      } finally {
        setIsSearching(false)
      }
    },
    [toast],
  )

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults(null)
    setIsSearching(false)
    setSearchQuery("")
  }, [])

  // Add user to channel
  const addUserToChannel = useCallback(
    async (channelId: string, userId: string): Promise<boolean> => {
      if (!currentUser) throw new Error("User not authenticated")

      try {
        // Add user to channel
        mockDataService.addUserToChannel(channelId, userId)

        // Update channels state
        setChannels((prevChannels) =>
          prevChannels.map((channel) =>
            channel.id === channelId ? { ...channel, participants: [...channel.participants, userId] } : channel,
          ),
        )

        return true
      } catch (error) {
        console.error("Error adding user to channel:", error)
        toast({
          title: "Error",
          description: "Failed to add user to channel. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [currentUser, toast],
  )

  const value: MessagingContextType = {
    users,
    channels,
    activeChannel,
    activeDirectMessage,
    messages,
    isLoadingMessages,
    activeThread,
    threadMessages,
    isLoadingThread,
    searchResults,
    isSearching,
    searchQuery,
    setActiveChannel,
    setActiveDirectMessage,
    setActiveThread,
    sendMessage,
    createChannel,
    addMessageReaction,
    sendThreadReply,
    sendNewMessage,
    editMessage,
    removeMessage,
    startDirectMessage,
    searchMessages,
    clearSearch,
    addUserToChannel,
  }

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
}

export function useMessaging() {
  const context = useContext(MessagingContext)
  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider")
  }
  return context
}
