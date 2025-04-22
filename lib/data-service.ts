import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { firestore, storage } from "./firebase"
import type { User, Channel, Message, Thread, Attachment, Reaction } from "./types"

// Users
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data() as User
    }
    return null
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "users", userId), {
      ...data,
      updatedAt: Date.now(),
    })
    return true
  } catch (error) {
    console.error("Error updating user:", error)
    return false
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(collection(firestore, "users"))
    return usersSnapshot.docs.map((doc) => doc.data() as User)
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

// Channels
export async function createChannel(
  channelData: Omit<Channel, "id" | "createdAt" | "updatedAt">,
): Promise<Channel | null> {
  try {
    const newChannel: Omit<Channel, "id"> = {
      ...channelData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const channelRef = await addDoc(collection(firestore, "channels"), newChannel)

    // Update with ID
    const channel: Channel = {
      ...newChannel,
      id: channelRef.id,
    }

    await setDoc(channelRef, channel)

    return channel
  } catch (error) {
    console.error("Error creating channel:", error)
    return null
  }
}

export async function getChannel(channelId: string): Promise<Channel | null> {
  try {
    const channelDoc = await getDoc(doc(firestore, "channels", channelId))
    if (channelDoc.exists()) {
      return channelDoc.data() as Channel
    }
    return null
  } catch (error) {
    console.error("Error getting channel:", error)
    return null
  }
}

export async function updateChannel(channelId: string, data: Partial<Channel>): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "channels", channelId), {
      ...data,
      updatedAt: Date.now(),
    })
    return true
  } catch (error) {
    console.error("Error updating channel:", error)
    return false
  }
}

export async function deleteChannel(channelId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(firestore, "channels", channelId))
    return true
  } catch (error) {
    console.error("Error deleting channel:", error)
    return false
  }
}

export async function getUserChannels(userId: string): Promise<Channel[]> {
  try {
    const q = query(
      collection(firestore, "channels"),
      where("members", "array-contains", userId),
      orderBy("updatedAt", "desc"),
    )

    const channelsSnapshot = await getDocs(q)
    return channelsSnapshot.docs.map((doc) => doc.data() as Channel)
  } catch (error) {
    console.error("Error getting user channels:", error)
    return []
  }
}

export function subscribeToUserChannels(userId: string, callback: (channels: Channel[]) => void): () => void {
  const q = query(
    collection(firestore, "channels"),
    where("members", "array-contains", userId),
    orderBy("updatedAt", "desc"),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const channels = snapshot.docs.map((doc) => doc.data() as Channel)
      callback(channels)
    },
    (error) => {
      console.error("Error subscribing to user channels:", error)
    },
  )
}

// Messages
export async function sendMessage(
  messageData: Omit<Message, "id" | "createdAt" | "updatedAt" | "isEdited" | "reactions">,
): Promise<Message | null> {
  try {
    const newMessage: Omit<Message, "id"> = {
      ...messageData,
      reactions: [],
      isEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const messageRef = await addDoc(collection(firestore, "messages"), newMessage)

    // Update with ID
    const message: Message = {
      ...newMessage,
      id: messageRef.id,
    }

    await setDoc(messageRef, message)

    // Update channel's updatedAt
    await updateDoc(doc(firestore, "channels", message.channelId), {
      updatedAt: Date.now(),
    })

    // If this is a thread reply, update the thread
    if (message.threadId) {
      await updateThread(message.threadId, {
        lastReplyAt: Date.now(),
        messageCount: (await getThreadMessageCount(message.threadId)) + 1,
      })
    }

    return message
  } catch (error) {
    console.error("Error sending message:", error)
    return null
  }
}

export async function getChannelMessages(channelId: string, limitCount = 50): Promise<Message[]> {
  try {
    const q = query(
      collection(firestore, "messages"),
      where("channelId", "==", channelId),
      where("threadId", "==", null), // Only get main channel messages, not thread replies
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    const messagesSnapshot = await getDocs(q)
    return messagesSnapshot.docs.map((doc) => doc.data() as Message).reverse() // Reverse to get oldest first
  } catch (error) {
    console.error("Error getting channel messages:", error)
    return []
  }
}

export function subscribeToChannelMessages(channelId: string, callback: (messages: Message[]) => void): () => void {
  const q = query(
    collection(firestore, "messages"),
    where("channelId", "==", channelId),
    where("threadId", "==", null), // Only get main channel messages, not thread replies
    orderBy("createdAt", "desc"),
    limit(50),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data() as Message).reverse() // Reverse to get oldest first
      callback(messages)
    },
    (error) => {
      console.error("Error subscribing to channel messages:", error)
    },
  )
}

export async function updateMessage(messageId: string, data: Partial<Message>): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "messages", messageId), {
      ...data,
      isEdited: true,
      updatedAt: Date.now(),
    })
    return true
  } catch (error) {
    console.error("Error updating message:", error)
    return false
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const messageDoc = await getDoc(doc(firestore, "messages", messageId))
    if (messageDoc.exists()) {
      const message = messageDoc.data() as Message

      // If this is a thread parent, delete all thread replies
      if (!message.threadId) {
        const threadReplies = await getThreadMessages(messageId)
        for (const reply of threadReplies) {
          await deleteDoc(doc(firestore, "messages", reply.id))
        }
      }

      await deleteDoc(doc(firestore, "messages", messageId))
      return true
    }
    return false
  } catch (error) {
    console.error("Error deleting message:", error)
    return false
  }
}

// Threads
export async function createThread(threadData: Omit<Thread, "messageCount" | "lastReplyAt">): Promise<Thread | null> {
  try {
    const newThread: Thread = {
      ...threadData,
      messageCount: 1, // Start with the parent message
      lastReplyAt: Date.now(),
    }

    await setDoc(doc(firestore, "threads", threadData.id), newThread)
    return newThread
  } catch (error) {
    console.error("Error creating thread:", error)
    return null
  }
}

export async function getThread(threadId: string): Promise<Thread | null> {
  try {
    const threadDoc = await getDoc(doc(firestore, "threads", threadId))
    if (threadDoc.exists()) {
      return threadDoc.data() as Thread
    }
    return null
  } catch (error) {
    console.error("Error getting thread:", error)
    return null
  }
}

export async function updateThread(threadId: string, data: Partial<Thread>): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "threads", threadId), data)
    return true
  } catch (error) {
    console.error("Error updating thread:", error)
    return false
  }
}

export async function getThreadMessages(threadId: string): Promise<Message[]> {
  try {
    // First get the parent message
    const parentMessageDoc = await getDoc(doc(firestore, "messages", threadId))
    const messages: Message[] = []

    if (parentMessageDoc.exists()) {
      messages.push(parentMessageDoc.data() as Message)
    }

    // Then get all replies
    const q = query(collection(firestore, "messages"), where("threadId", "==", threadId), orderBy("createdAt", "asc"))

    const repliesSnapshot = await getDocs(q)
    messages.push(...repliesSnapshot.docs.map((doc) => doc.data() as Message))

    return messages
  } catch (error) {
    console.error("Error getting thread messages:", error)
    return []
  }
}

export function subscribeToThreadMessages(threadId: string, callback: (messages: Message[]) => void): () => void {
  // We need two subscriptions: one for the parent message and one for replies
  let parentMessage: Message | null = null
  let replies: Message[] = []

  // Function to combine and sort all messages
  const updateMessages = () => {
    const allMessages = parentMessage ? [parentMessage, ...replies] : [...replies]
    callback(allMessages)
  }

  // Subscribe to parent message
  const parentUnsubscribe = onSnapshot(
    doc(firestore, "messages", threadId),
    (doc) => {
      if (doc.exists()) {
        parentMessage = doc.data() as Message
      } else {
        parentMessage = null
      }
      updateMessages()
    },
    (error) => {
      console.error("Error subscribing to parent message:", error)
    },
  )

  // Subscribe to replies
  const q = query(collection(firestore, "messages"), where("threadId", "==", threadId), orderBy("createdAt", "asc"))

  const repliesUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      replies = snapshot.docs.map((doc) => doc.data() as Message)
      updateMessages()
    },
    (error) => {
      console.error("Error subscribing to thread replies:", error)
    },
  )

  // Return a function to unsubscribe from both
  return () => {
    parentUnsubscribe()
    repliesUnsubscribe()
  }
}

export async function getThreadMessageCount(threadId: string): Promise<number> {
  try {
    const q = query(collection(firestore, "messages"), where("threadId", "==", threadId))

    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error("Error getting thread message count:", error)
    return 0
  }
}

// Reactions
export async function addReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
  try {
    const messageRef = doc(firestore, "messages", messageId)
    const messageDoc = await getDoc(messageRef)

    if (messageDoc.exists()) {
      const message = messageDoc.data() as Message

      // Check if user already reacted with this emoji
      const existingReaction = message.reactions.find((r) => r.userId === userId && r.emoji === emoji)

      if (existingReaction) {
        // Remove the reaction if it already exists
        const updatedReactions = message.reactions.filter((r) => !(r.userId === userId && r.emoji === emoji))
        await updateDoc(messageRef, { reactions: updatedReactions })
      } else {
        // Add the new reaction
        const newReaction: Reaction = {
          id: `${messageId}-${userId}-${Date.now()}`,
          userId,
          emoji,
          createdAt: Date.now(),
        }

        await updateDoc(messageRef, {
          reactions: [...message.reactions, newReaction],
        })
      }

      return true
    }

    return false
  } catch (error) {
    console.error("Error adding reaction:", error)
    return false
  }
}

// Attachments
export async function uploadAttachment(file: File, userId: string): Promise<Attachment | null> {
  try {
    const fileId = `${userId}-${Date.now()}-${file.name}`
    const storageRef = ref(storage, `attachments/${fileId}`)

    await uploadBytes(storageRef, file)
    const downloadUrl = await getDownloadURL(storageRef)

    const attachment: Attachment = {
      id: fileId,
      type: file.type.startsWith("image/") ? "image" : "file",
      url: downloadUrl,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      createdAt: Date.now(),
    }

    return attachment
  } catch (error) {
    console.error("Error uploading attachment:", error)
    return null
  }
}

// Search
export async function searchMessages(query: string, userId: string): Promise<Message[]> {
  try {
    // Get all channels the user is a member of
    const userChannels = await getUserChannels(userId)
    const channelIds = userChannels.map((channel) => channel.id)

    // This is a simple implementation - in a real app, you'd use Algolia or another search service
    // For now, we'll fetch recent messages and filter client-side
    const messages: Message[] = []

    for (const channelId of channelIds) {
      const channelMessages = await getChannelMessages(channelId, 100)
      messages.push(...channelMessages)
    }

    // Filter messages that contain the query
    return messages.filter((message) => message.content.toLowerCase().includes(query.toLowerCase()))
  } catch (error) {
    console.error("Error searching messages:", error)
    return []
  }
}
