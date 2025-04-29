import { supabase } from "@/src/services/supabase/client"
import type { UserSettings } from "@/src/lib/types/supabase-types"

/**
 * Fetches user settings for a specific user
 * @param userId - The ID of the user
 * @returns Promise with user settings or null if not found
 */
export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found, return null
        return null
      }
      throw error
    }

    return data as UserSettings
  } catch (error) {
    console.error("Error fetching user settings:", error)
    throw error
  }
}

/**
 * Creates or updates user settings
 * @param userId - The ID of the user
 * @param settings - The settings to update
 * @returns Promise with the updated settings
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<UserSettings> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // Check if settings exist for this user
    const existingSettings = await fetchUserSettings(userId)

    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from("user_settings")
        .update(settings)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as UserSettings
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("user_settings")
        .insert({
          user_id: userId,
          ...settings,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as UserSettings
    }
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw error
  }
}
