export interface Channel {
  id: string
  name: string
  description?: string
  is_private: boolean
  created_at: string
  created_by: string
  updated_at?: string
}
