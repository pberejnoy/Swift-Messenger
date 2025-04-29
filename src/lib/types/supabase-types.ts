/**
 * User profile information
 */
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at?: string
  last_seen?: string // Note: This is the correct field name in the database
  status?: "online" | "offline" | "away" | "busy"
  is_admin?: boolean
}

/**
 * Channel information for group messaging
 */
export interface Channel {
  id: string
  name: string
  description?: string
  is_private: boolean
  created_at: string
  created_by: string
  updated_at?: string
}

/**
 * Message in a channel
 */
export interface Message {
  id: string
  user_id: string
  channel_id: string
  content: string
  created_at: string
  updated_at?: string
  is_edited?: boolean // Made optional to match potential database schema
  attachments?: any
  // Join fields
  users?: {
    username: string
    avatar_url?: string
  }
}

/**
 * Direct message between two users
 */
export interface DirectMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  updated_at?: string
  is_edited?: boolean // Made optional to match potential database schema
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

/**
 * Reaction to a message (emoji)
 */
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

/**
 * File attachment for messages
 */
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

/**
 * User preferences and settings
 */
export interface UserSettings {
  id: string
  user_id: string
  theme: string
  notifications_enabled: boolean
  sound_enabled: boolean
  language: string
  created_at: string
  updated_at?: string
}

/**
 * User online status and presence information
 */
export interface Presence {
  id: string
  user_id: string
  status: "online" | "offline" | "away" | "busy"
  last_seen_at: string
  updated_at: string
}

/**
 * Database schema type definitions for Supabase
 */
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
      reactions: {
        Row: Reaction
        Insert: Omit<Reaction, "id" | "created_at">
        Update: Partial<Omit<Reaction, "id" | "created_at">>
      }
      attachments: {
        Row: Attachment
        Insert: Omit<Attachment, "id" | "created_at">
        Update: Partial<Omit<Attachment, "id" | "created_at">>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, "id" | "created_at">
        Update: Partial<Omit<UserSettings, "id" | "created_at">>
      }
      presence: {
        Row: Presence
        Insert: Omit<Presence, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Presence, "id" | "created_at">>
      }
    }
  }
}
