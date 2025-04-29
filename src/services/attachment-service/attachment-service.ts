import { supabase } from "@/src/services/supabase/client"
import type { Attachment } from "@/src/lib/types/supabase-types"

/**
 * Fetches attachments for a specific message
 * @param messageId - The ID of the message
 * @param messageType - The type of message ('channel' or 'direct')
 * @returns Promise with array of attachments
 */
export async function fetchAttachments(messageId: string, messageType: "channel" | "direct"): Promise<Attachment[]> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("message_id", messageId)
      .eq("message_type", messageType)

    if (error) {
      throw error
    }

    return data as Attachment[]
  } catch (error) {
    console.error("Error fetching attachments:", error)
    throw error
  }
}

/**
 * Creates a new attachment record
 * @param messageId - The ID of the message
 * @param messageType - The type of message ('channel' or 'direct')
 * @param fileName - The name of the file
 * @param fileType - The MIME type of the file
 * @param fileSize - The size of the file in bytes
 * @param url - The URL of the file
 * @param thumbnailUrl - The URL of the thumbnail (optional)
 * @param userId - The ID of the user who created the attachment
 * @returns Promise with the created attachment
 */
export async function createAttachment(
  messageId: string,
  messageType: "channel" | "direct",
  fileName: string,
  fileType: string,
  fileSize: number,
  url: string,
  thumbnailUrl: string | null,
  userId: string,
): Promise<Attachment> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    const { data, error } = await supabase
      .from("attachments")
      .insert({
        message_id: messageId,
        message_type: messageType,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        url: url,
        thumbnail_url: thumbnailUrl,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Attachment
  } catch (error) {
    console.error("Error creating attachment:", error)
    throw error
  }
}

/**
 * Deletes an attachment
 * @param attachmentId - The ID of the attachment to delete
 * @param userId - The ID of the user attempting to delete the attachment
 * @returns Promise<void>
 */
export async function deleteAttachment(attachmentId: string, userId: string): Promise<void> {
  try {
    if (!supabase) {
      throw new Error("Supabase client not initialized")
    }

    // First check if the user is the creator of the attachment
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select("created_by")
      .eq("id", attachmentId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (attachment.created_by !== userId) {
      throw new Error("You don't have permission to delete this attachment")
    }

    const { error } = await supabase.from("attachments").delete().eq("id", attachmentId)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error deleting attachment:", error)
    throw error
  }
}
