// User type
export type User = {
  id: string
  email: string
  displayName?: string
  avatar?: string
  isAdmin?: boolean
  isOnline?: boolean
  status?: string
}

// Message type
export type Message = {
  id: string
  content: string
  userId: string
  channelId?: string
  dmId?: string
  parentId?: string
  createdAt: number
  updatedAt?: number
  isEdited?: boolean
  reactions?: {
    emoji: string
    userId: string
  }[]
  threadCount?: number
}

// Channel type
export type Channel = {
  id: string
  name: string
  description?: string
  isPrivate: boolean
  createdBy: string
  members: string[]
  createdAt: number
}

// Direct Message type
export type DirectMessage = {
  id: string
  participants: string[]
  createdAt: number
}
