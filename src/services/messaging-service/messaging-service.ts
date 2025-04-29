import { supabase } from "@/src/services/supabase/client"
import type { Channel, Message } from "@/src/lib/types/supabase-types"

/**
 * Fetches all channels from Supabase
 * @returns Promise with array of channels
 */
export async function fetchChannels(): Promise<Channel[]> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from("channels").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data as Channel[]
  } catch (error) {
    console.error("Error fetching channels:", error)
    throw error
  }
}

/**
 * Fetches a specific channel by ID
 * @param channelId - The ID of the channel to fetch
 * @returns Promise with channel data
 */
export async function fetchChannelById(channelId: string): Promise<Channel | null> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase.from("channels").select("*").eq("id", channelId).single()

    if (error) {
      throw error
    }

    return data as Channel
  } catch (error) {
    console.error(`Error fetching channel with ID ${channelId}:`, error)
    return null
  }
}

/**
 * Fetches messages for a specific channel
 * @param channelId - The ID of the channel to fetch messages for
 * @returns Promise with array of messages
 */
export async function fetchMessagesByChannel(channelId: string): Promise<Message[]> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*, users(username, avatar_url)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true })

    if (error) {
      throw error
    }

    return data as unknown as Message[]
  } catch (error) {
    console.error(`Error fetching messages for channel ${channelId}:`, error)
    throw error
  }
}

/**
 * Sends a new message to a channel
 * @param channelId - The ID of the channel to send the message to
 * @param userId - The ID of the user sending the message
 * @param content - The content of the message
 * @returns Promise with the sent message
 */
export async function sendMessage(channelId: string, userId: string, content: string): Promise<Message> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    console.log("Sending message with user_id:", userId, "to channel:", channelId)

    // Verify user exists in the users table before sending
    const { data: userExists, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError) {
      console.error("User does not exist in database:", userCheckError)
      throw new Error(`User with ID ${userId} does not exist in the database. Please refresh and try again.`)
    }

    console.log("User exists in database, proceeding with message send")

    // Create the message data object with required fields
    const messageData = {
      channel_id: channelId,
      user_id: userId,
      content,
    }

    // Insert the message
    const { data, error } = await supabase.from("messages").insert(messageData).select().single()

    if (error) {
      console.error("Error inserting message:", error)
      throw error
    }

    console.log("Message sent successfully:", data)
    return data as Message
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

/**
 * Creates a new channel
 * @param name - The name of the channel
 * @param description - The description of the channel
 * @param userId - The ID of the user creating the channel
 * @param isPrivate - Whether the channel is private
 * @returns Promise with the created channel
 */
export async function createChannel(
  name: string,
  description: string,
  userId: string,
  isPrivate = false,
): Promise<Channel> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // Verify user exists in the users table before creating channel
    const { data: userExists, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (userCheckError) {
      console.error("User does not exist in database:", userCheckError)
      throw new Error(`User with ID ${userId} does not exist in the database. Please refresh and try again.`)
    }

    const { data, error } = await supabase
      .from("channels")
      .insert({
        name,
        description,
        created_by: userId,
        is_private: isPrivate,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Channel
  } catch (error) {
    console.error("Error creating channel:", error)
    throw error
  }
}

/**
 * Subscribes to new messages in a channel
 * @param channelId - The ID of the channel to subscribe to
 * @param callback - The callback function to execute when a new message is received
 * @returns A function to unsubscribe from the channel
 */
export function subscribeToChannelMessages(channelId: string, callback: (message: Message) => void): () => void {
  if (!supabase) {
    console.warn("Supabase client not initialized")
    return () => {}
  }

  const subscription = supabase
    .channel(`messages:channel_id=eq.${channelId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      },
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}

/**
 * Subscribes to new channels
 * @param callback - The callback function to execute when a new channel is created
 * @returns A function to unsubscribe from the channel updates
 */
export function subscribeToChannels(callback: (channel: Channel) => void): () => void {
  if (!supabase) {
    console.warn("Supabase client not initialized")
    return () => {}
  }

  const subscription = supabase
    .channel("channels")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "channels",
      },
      (payload) => {
        callback(payload.new as Channel)
      },
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
