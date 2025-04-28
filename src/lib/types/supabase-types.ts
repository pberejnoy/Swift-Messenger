export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at?: string
  last_seen?: string
  status?: "online" | "offline" | "away" | "busy"
}

export interface Channel {
  id: string
  name: string
  description?: string
  is_private: boolean
  created_at: string
  created_by: string
  updated_at?: string
}

export interface Message {
  id: string
  user_id: string
  channel_id?: string
  content: string
  created_at: string
  updated_at?: string
  is_edited: boolean
  attachments?: any
}

export interface DirectMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  updated_at?: string
  is_edited: boolean
  is_read: boolean
  attachments?: any
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, "id" | "created_at">
        Update: Partial<Omit<User, "id" | "created_at">>
      }
      channels: {
        Row: Channel
        Insert: Omit<Channel, "id" | "created_at">
        Update: Partial<Omit<Channel, "id" | "created_at">>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, "id" | "created_at">
        Update: Partial<Omit<Message, "id" | "created_at">>
      }
      direct_messages: {
        Row: DirectMessage
        Insert: Omit<DirectMessage, "id" | "created_at">
        Update: Partial<Omit<DirectMessage, "id" | "created_at">>
      }
    }
  }
}
