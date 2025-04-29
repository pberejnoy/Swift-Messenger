import type {
  UserProfile,
  UserSettings,
  UserPresence,
  Message,
  DirectMessage,
  Reaction,
  Attachment,
  Channel,
} from "@/src/core/types"

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile
        Insert: Omit<UserProfile, "id" | "created_at">
        Update: Partial<Omit<UserProfile, "id" | "created_at">>
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
        Row: UserPresence
        Insert: Omit<UserPresence, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<UserPresence, "id" | "created_at">>
      }
    }
  }
}
