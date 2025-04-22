// Data models for the messenger application

export type User = {
  id: string
  name: string
  avatar: string
  email: string
  status: "online" | "offline" | "away"
  lastActive?: number
}

export type MessageReaction = {
  id: string
  userId: string
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry"
  createdAt: number
}

export type MessageComment = {
  id: string
  userId: string
  content: string
  createdAt: number
}

export type Message = {
  id: string
  channelId: string
  userId: string
  content: string
  createdAt: number
  edited?: boolean
  editedAt?: number
  reactions: MessageReaction[]
  comments: MessageComment[]
}

export type Channel = {
  id: string
  name: string
  description: string
  createdAt: number
  isPrivate: boolean
  members: string[] // User IDs
  messages: string[] // Message IDs
}

export type MessengerState = {
  users: Record<string, User>
  channels: Record<string, Channel>
  messages: Record<string, Message>
  currentUser: string // Current user ID
  activeChannel: string // Active channel ID
}
