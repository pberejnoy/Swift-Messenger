export interface Message {
  id: string
  user_id: string
  channel_id: string
  content: string
  created_at: string
  updated_at?: string
  is_edited?: boolean
  attachments?: any
  // Join fields
  users?: {
    username: string
    avatar_url?: string
  }
}

export interface DirectMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  updated_at?: string
  is_edited?: boolean
  is_read: boolean
  attachments?: any
  // Join fields
  sender?: {
    username: string
    avatar_url?: string
  }
  recipient?: {
    username: string
    avatar_url?: string
  }
}

export interface Reaction {
  id: string
  user_id: string
  message_id: string
  message_type: "channel" | "direct"
  emoji: string
  created_at: string
  // Join fields
  users?: {
    username: string
    avatar_url?: string
  }
}

export interface Attachment {
  id: string
  message_id: string
  message_type: "channel" | "direct"
  file_name: string
  file_type: string
  file_size: number
  url: string
  thumbnail_url?: string
  created_at: string
  created_by: string
}
