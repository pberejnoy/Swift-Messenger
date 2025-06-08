import { supabase } from "@/src/services/supabase/client"
import type { DirectMessage } from "@/src/lib/types/supabase-types"

/**
 * Fetches direct messages between two users
 * @param userId - The current user's ID
 * @param otherUserId - The other user's ID
 * @returns Promise with array of direct messages
 */
export async function fetchDirectMessages(userId: string, otherUserId: string): Promise<DirectMessage[]> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .select(
        `*,
        sender:sender_id(username, avatar_url),
        recipient:recipient_id(username, avatar_url)`,
      )
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`,
      )
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return data as unknown as DirectMessage[]
  } catch (error) {
    console.error("Error fetching direct messages:", error)
    throw error
  }
}

/**
 * Sends a direct message to another user
 * @param senderId - The sender's user ID
 * @param recipientId - The recipient's user ID
 * @param content - The content of the message
 * @returns Promise with the sent message
 */
export async function sendDirectMessage(
  senderId: string,
  recipientId: string,
  content: string,
): Promise<DirectMessage> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        is_edited: false,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as DirectMessage
  } catch (error) {
    console.error("Error sending direct message:", error)
    throw error
  }
}

/**
 * Marks direct messages as read
 * @param userId - The current user's ID
 * @param senderId - The sender's user ID
 * @returns Promise with the number of updated messages
 */
export async function markDirectMessagesAsRead(userId: string, senderId: string): Promise<number> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("recipient_id", userId)
      .eq("sender_id", senderId)
      .eq("is_read", false)

    if (error) {
      throw error
    }

    return data?.length || 0
  } catch (error) {
    console.error("Error marking messages as read:", error)
    throw error
  }
}

/**
 * Subscribes to new direct messages
 * @param userId - The current user's ID
 * @param callback - The callback function to execute when a new message is received
 * @returns A function to unsubscribe from the direct messages
 */
export function subscribeToDirectMessages(userId: string, callback: (message: DirectMessage) => void): () => void {
  if (!supabase) {
    console.warn("Supabase client not initialized")
    return () => {}
  }

  const subscription = supabase
    .channel(`direct_messages:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as DirectMessage)
      },
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
