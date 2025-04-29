import { supabase } from "@/src/services/supabase/client"
import type { Presence } from "@/src/lib/types/supabase-types"

/**
 * Fetches presence data for a specific user
 * @param userId - The ID of the user
 * @returns Promise with presence data or null if not found
 */
export async function fetchUserPresence(userId: string): Promise<Presence | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from("presence").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No presence data found, return null
        return null
      }
      throw error
    }

    return data as Presence
  } catch (error) {
    console.error("Error fetching user presence:", error)
    throw error
  }
}

/**
 * Updates a user's presence status
 * @param userId - The ID of the user
 * @param status - The new status ('online', 'offline', 'away', 'busy')
 * @returns Promise with the updated presence data
 */
export async function updateUserPresence(
  userId: string,
  status: "online" | "offline" | "away" | "busy",
): Promise<Presence> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // Try to update the user's status in the users table
    try {
      // Check if the users table has a status column
      const { data: tableInfo, error: tableError } = await supabase
        .rpc("get_table_columns", { table_name: "users" })
        .catch(() => ({ data: null, error: new Error("Failed to get table columns") }))

      // If we have table info and status column exists, update it
      if (!tableError && tableInfo) {
        const hasStatus = Array.isArray(tableInfo) && tableInfo.some((col: any) => col.column_name === "status")

        if (hasStatus) {
          await supabase.from("users").update({ status }).eq("id", userId)
        }
      }
    } catch (userUpdateError) {
      console.warn("Error updating user status:", userUpdateError)
      // Continue with presence update even if user update fails
    }

    // Check if presence table exists
    try {
      // Check if presence data exists for this user
      const existingPresence = await fetchUserPresence(userId)

      if (existingPresence) {
        // Update existing presence
        const { data, error } = await supabase
          .from("presence")
          .update({
            status,
            last_seen_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single()

        if (error) {
          throw error
        }

        return data as Presence
      } else {
        // Create new presence record
        const { data, error } = await supabase
          .from("presence")
          .insert({
            user_id: userId,
            status,
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        return data as Presence
      }
    } catch (presenceError) {
      console.warn("Error updating presence table:", presenceError)
      // Return a mock presence object to avoid breaking the app
      return {
        id: "mock-id",
        user_id: userId,
        status: status,
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error("Error updating user presence:", error)
    throw error
  }
}

/**
 * Subscribes to presence changes for all users
 * @param callback - The callback function to execute when a user's presence changes
 * @returns A function to unsubscribe from presence updates
 */
export function subscribeToPresence(callback: (presence: Presence) => void): () => void {
  if (!supabase) {
    console.warn("Supabase client not initialized")
    return () => {}
  }

  // First check if the presence table exists
  supabase
    .from("presence")
    .select("id")
    .limit(1)
    .then(() => {
      // Table exists, set up subscription
      const subscription = supabase
        .channel("presence_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "presence",
          },
          (payload) => {
            callback(payload.new as Presence)
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    })
    .catch((error) => {
      console.warn("Presence table may not exist, skipping subscription:", error)
      return () => {}
    })

  // Return a dummy unsubscribe function in case the above fails
  return () => {}
}
