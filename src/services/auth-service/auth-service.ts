import { supabase } from "../supabase/client"
import type { User } from "@supabase/supabase-js"
import { updateUserPresence } from "../presence-service/presence-service"

/**
 * Signs up a new user
 * @param email - User's email
 * @param password - User's password
 * @param username - User's username
 * @returns Promise with user and session data
 */
export async function signUp(email: string, password: string, username: string) {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) {
      throw error
    }

    // Create user profile if user was created
    if (data.user) {
      try {
        await createOrUpdateUserProfile(data.user.id, {
          email,
          username,
        })
      } catch (err) {
        console.warn("Failed to create user profile, but continuing:", err)
      }
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

/**
 * Signs in an existing user
 * @param email - User's email
 * @param password - User's password
 * @returns Promise with user and session data
 */
export async function signIn(email: string, password: string) {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    // Update user's status
    if (data.user) {
      try {
        // Try to update last seen, but don't fail if it doesn't work
        try {
          await updateUserLastSeen(data.user.id)
        } catch (err) {
          console.warn("Failed to update last seen, continuing anyway:", err)
        }

        try {
          await updateUserPresence(data.user.id, "online")
        } catch (err) {
          console.warn("Failed to update presence, continuing anyway:", err)
        }
      } catch (presenceError) {
        // Log but don't fail the sign-in process
        console.warn("Error updating user status:", presenceError)
      }
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

/**
 * Signs out the current user
 */
export async function signOut() {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // Get current user before signing out
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    // Update presence to offline if we have a user
    if (userId) {
      try {
        try {
          await updateUserPresence(userId, "offline")
        } catch (err) {
          console.warn("Failed to update presence on sign out:", err)
        }
      } catch (presenceError) {
        console.warn("Error updating presence on sign out:", presenceError)
      }
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

/**
 * Gets the current authenticated user
 * @returns Promise with user data or null
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.auth.getUser()
    if (error) {
      throw error
    }

    // Update user's last seen if we have a user
    if (data.user) {
      try {
        try {
          await updateUserLastSeen(data.user.id)
        } catch (err) {
          console.warn("Failed to update last seen, continuing anyway:", err)
        }
      } catch (error) {
        console.warn("Error updating last seen:", error)
      }
    }

    return data.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Gets table columns using RPC
 * @param tableName - The name of the table
 * @returns Promise with array of column information or null
 */
async function getTableColumns(tableName: string): Promise<any[] | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    try {
      const { data, error } = await supabase.rpc("get_table_columns", { table_name: tableName })

      if (error) {
        console.warn(`Error getting columns for ${tableName}:`, error)
        return null
      }

      if (!Array.isArray(data)) {
        console.warn(`Unexpected response format when getting columns for ${tableName}`)
        return null
      }

      return data
    } catch (error) {
      console.warn(`Error in RPC call when getting columns for ${tableName}:`, error)
      return null
    }
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error)
    return null
  }
}

/**
 * Creates or updates a user profile in the users table
 * @param userId - The user's ID
 * @param userData - The user data to update
 * @returns Promise with the created/updated user data
 */
export async function createOrUpdateUserProfile(
  userId: string,
  userData: {
    email: string
    username: string
    avatar_url?: string
  },
) {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    // Get the table structure to check available columns
    const tableInfo = await getTableColumns("users")

    // Default update data
    const updateData: Record<string, any> = {
      email: userData.email,
      username: userData.username,
    }

    // Only add avatar_url if provided
    if (userData.avatar_url) {
      updateData.avatar_url = userData.avatar_url
    }

    // Check if last_seen column exists and add it if it does
    const hasLastSeen = Array.isArray(tableInfo) && tableInfo.some((col: any) => col.column_name === "last_seen")

    if (hasLastSeen) {
      updateData.last_seen = new Date().toISOString()
    }

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase.from("users").update(updateData).eq("id", userId).select().single()

      if (error) {
        throw error
      }

      return data
    } else {
      // Create new user
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          ...updateData,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    }
  } catch (error) {
    console.error("Error creating/updating user profile:", error)
    throw error
  }
}

/**
 * Updates a user's last seen timestamp
 * @param userId - The user's ID
 * @returns Promise<void>
 */
export async function updateUserLastSeen(userId: string): Promise<void> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // First, check if the users table has a last_seen column
    const tableInfo = await getTableColumns("users")

    // If we couldn't get table info, skip the update
    if (!tableInfo) {
      console.warn("Skipping last_seen update: couldn't verify schema")
      return
    }

    // Check if last_seen column exists
    const hasLastSeen = tableInfo.some((col: any) => col.column_name === "last_seen")

    if (!hasLastSeen) {
      console.warn("Skipping last_seen update: column doesn't exist in schema")
      return
    }

    // Update the last_seen column
    const { error } = await supabase
      .from("users")
      .update({
        last_seen: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error updating user last seen:", error)
    throw error
  }
}
