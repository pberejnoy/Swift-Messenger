import { supabase } from "@/src/services/supabase/client"
import type { Reaction } from "@/src/lib/types/supabase-types"

/**
 * Fetches reactions for a specific message
 * @param messageId - The ID of the message
 * @param messageType - The type of message ('channel' or 'direct')
 * @returns Promise with array of reactions
 */
export async function fetchReactions(messageId: string, messageType: "channel" | "direct"): Promise<Reaction[]> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("reactions")
      .select("*, users(username, avatar_url)")
      .eq("message_id", messageId)
      .eq("message_type", messageType)

    if (error) {
      throw error
    }

    return data as unknown as Reaction[]
  } catch (error) {
    console.error("Error fetching reactions:", error)
    throw error
  }
}

/**
 * Adds a reaction to a message
 * @param userId - The user ID adding the reaction
 * @param messageId - The ID of the message
 * @param messageType - The type of message ('channel' or 'direct')
 * @param emoji - The emoji reaction
 * @returns Promise with the added reaction
 */
export async function addReaction(
  userId: string,
  messageId: string,
  messageType: "channel" | "direct",
  emoji: string,
): Promise<Reaction> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("reactions")
      .insert({
        user_id: userId,
        message_id: messageId,
        message_type: messageType,
        emoji,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Reaction
  } catch (error) {
    console.error("Error adding reaction:", error)
    throw error
  }
}

/**
 * Removes a reaction from a message
 * @param userId - The user ID removing the reaction
 * @param messageId - The ID of the message
 * @param messageType - The type of message ('channel' or 'direct')
 * @param emoji - The emoji reaction
 * @returns Promise<void>
 */
export async function removeReaction(
  userId: string,
  messageId: string,
  messageType: "channel" | "direct",
  emoji: string,
): Promise<void> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { error } = await supabase
      .from("reactions")
      .delete()
      .eq("user_id", userId)
      .eq("message_id", messageId)
      .eq("message_type", messageType)
      .eq("emoji", emoji)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error removing reaction:", error)
    throw error
  }
}

/**
 * Subscribes to reactions for a specific message
 * @param messageId - The ID of the message
 * @param messageType - The type of message ('channel' or 'direct')
 * @param callback - The callback function to execute when a reaction is added or removed
 * @returns A function to unsubscribe from the reactions
 */
export function subscribeToReactions(
  messageId: string,
  messageType: "channel" | "direct",
  callback: (reaction: Reaction, event: "INSERT" | "DELETE") => void,
): () => void {
  if (!supabase) {
    console.warn("Supabase client not initialized")
    return () => {}
  }

  const subscription = supabase
    .channel(`reactions:${messageId}:${messageType}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "reactions",
        filter: `message_id=eq.${messageId}`,
      },
      (payload) => {
        callback(payload.new as Reaction, "INSERT")
      },
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "reactions",
        filter: `message_id=eq.${messageId}`,
      },
      (payload) => {
        callback(payload.old as Reaction, "DELETE")
      },
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
