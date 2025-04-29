export interface UserProfile {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
  updated_at?: string
  last_seen?: string
  status?: "online" | "offline" | "away" | "busy"
  is_admin?: boolean
}

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

export interface UserPresence {
  id: string
  user_id: string
  status: "online" | "offline" | "away" | "busy"
  last_seen_at: string
  updated_at: string
}
