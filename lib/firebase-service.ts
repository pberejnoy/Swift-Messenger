import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Message, Channel, DirectMessage, User } from "@/lib/types"

// Convert Firestore timestamp to number for consistency
const convertTimestamp = (timestamp: Timestamp | number | undefined): number => {
  if (!timestamp) return Date.now()
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis()
  }
  return timestamp as number
}

// Channels
export const getChannels = async (): Promise<Channel[]> => {
  try {
    const channelsRef = collection(db, "channels")
    const snapshot = await getDocs(channelsRef)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description || "",
        isPrivate: data.isPrivate || false,
        createdBy: data.createdBy,
        members: data.members || [],
        createdAt: convertTimestamp(data.createdAt),
      }
    })
  } catch (error: any) {
    console.error("Error getting channels:", error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to access channels collection. Using local storage fallback.")
    }
    return []
  }
}

export const createChannel = async (channelData: Omit<Channel, "id">): Promise<Channel | null> => {
  try {
    const channelsRef = collection(db, "channels")
    const docRef = await addDoc(channelsRef, {
      ...channelData,
      createdAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      ...channelData,
      createdAt: Date.now(),
    }
  } catch (error: any) {
    console.error("Error creating channel:", error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to create channel. Using local storage fallback.")
    }
    return null
  }
}

// Messages
export const getChannelMessages = async (channelId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("channelId", "==", channelId), orderBy("createdAt", "asc"))

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        content: data.content,
        userId: data.userId,
        channelId: data.channelId,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        isEdited: data.isEdited || false,
        reactions: data.reactions || [],
        threadCount: data.threadCount || 0,
      }
    })
  } catch (error: any) {
    console.error(`Error getting messages for channel ${channelId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to access messages. Using local storage fallback.")
    }
    return []
  }
}

export const listenToChannelMessages = (channelId: string, callback: (messages: Message[]) => void): (() => void) => {
  try {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("channelId", "==", channelId), orderBy("createdAt", "asc"))

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            content: data.content,
            userId: data.userId,
            channelId: data.channelId,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            isEdited: data.isEdited || false,
            reactions: data.reactions || [],
            threadCount: data.threadCount || 0,
          }
        })
        callback(messages)
      },
      (error) => {
        console.error(`Error listening to channel messages for ${channelId}:`, error)
        // Return empty array on error to trigger local storage fallback
        callback([])
      },
    )
  } catch (error) {
    console.error(`Error setting up listener for channel ${channelId}:`, error)
    // Return a no-op cleanup function
    return () => {}
  }
}

export const sendMessage = async (messageData: Omit<Message, "id">): Promise<Message | null> => {
  try {
    const messagesRef = collection(db, "messages")
    const docRef = await addDoc(messagesRef, {
      ...messageData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isEdited: false,
      reactions: messageData.reactions || [],
    })

    return {
      id: docRef.id,
      ...messageData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEdited: false,
      reactions: messageData.reactions || [],
    }
  } catch (error: any) {
    console.error("Error sending message:", error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to send message. Using local storage fallback.")
    }
    return null
  }
}

export const updateMessage = async (messageId: string, updates: Partial<Message>): Promise<boolean> => {
  try {
    const messageRef = doc(db, "messages", messageId)
    await updateDoc(messageRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      isEdited: true,
    })
    return true
  } catch (error: any) {
    console.error(`Error updating message ${messageId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to update message. Using local storage fallback.")
    }
    return false
  }
}

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    const messageRef = doc(db, "messages", messageId)
    await deleteDoc(messageRef)
    return true
  } catch (error: any) {
    console.error(`Error deleting message ${messageId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to delete message. Using local storage fallback.")
    }
    return false
  }
}

export const addReaction = async (messageId: string, reaction: { emoji: string; userId: string }): Promise<boolean> => {
  try {
    const messageRef = doc(db, "messages", messageId)
    const messageDoc = await getDoc(messageRef)

    if (!messageDoc.exists()) {
      throw new Error("Message not found")
    }

    const messageData = messageDoc.data()
    const reactions = messageData.reactions || []

    // Check if user already reacted with this emoji
    const existingIndex = reactions.findIndex((r: any) => r.emoji === reaction.emoji && r.userId === reaction.userId)

    let updatedReactions

    if (existingIndex >= 0) {
      // Remove reaction if it exists
      updatedReactions = [...reactions.slice(0, existingIndex), ...reactions.slice(existingIndex + 1)]
    } else {
      // Add reaction if it doesn't exist
      updatedReactions = [...reactions, reaction]
    }

    await updateDoc(messageRef, {
      reactions: updatedReactions,
    })

    return true
  } catch (error: any) {
    console.error(`Error adding reaction to message ${messageId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to add reaction. Using local storage fallback.")
    }
    return false
  }
}

// Direct Messages
export const getDMMessages = async (dmId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("dmId", "==", dmId), orderBy("createdAt", "asc"))

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        content: data.content,
        userId: data.userId,
        dmId: data.dmId,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        isEdited: data.isEdited || false,
        reactions: data.reactions || [],
        threadCount: data.threadCount || 0,
      }
    })
  } catch (error: any) {
    console.error(`Error getting messages for DM ${dmId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to access DM messages. Using local storage fallback.")
    }
    return []
  }
}

export const listenToDMMessages = (dmId: string, callback: (messages: Message[]) => void): (() => void) => {
  try {
    const messagesRef = collection(db, "messages")
    const q = query(messagesRef, where("dmId", "==", dmId), orderBy("createdAt", "asc"))

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            content: data.content,
            userId: data.userId,
            dmId: data.dmId,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            isEdited: data.isEdited || false,
            reactions: data.reactions || [],
            threadCount: data.threadCount || 0,
          }
        })
        callback(messages)
      },
      (error) => {
        console.error(`Error listening to DM messages for ${dmId}:`, error)
        // Return empty array on error to trigger local storage fallback
        callback([])
      },
    )
  } catch (error) {
    console.error(`Error setting up listener for DM ${dmId}:`, error)
    // Return a no-op cleanup function
    return () => {}
  }
}

// Direct Message Conversations
export const getDirectMessages = async (userId: string): Promise<DirectMessage[]> => {
  try {
    const dmsRef = collection(db, "directMessages")
    const q = query(dmsRef, where("participants", "array-contains", userId))

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        participants: data.participants || [],
        createdAt: convertTimestamp(data.createdAt),
      }
    })
  } catch (error: any) {
    console.error(`Error getting direct messages for user ${userId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to access direct messages. Using local storage fallback.")
    }
    return []
  }
}

export const createOrGetDirectMessage = async (participants: string[]): Promise<DirectMessage | null> => {
  try {
    // Sort user IDs to ensure consistent ID
    const sortedParticipants = [...participants].sort()

    // Check if DM already exists
    const dmsRef = collection(db, "directMessages")
    const q = query(dmsRef, where("participants", "==", sortedParticipants))

    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      // DM already exists
      const doc = snapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        participants: data.participants,
        createdAt: convertTimestamp(data.createdAt),
      }
    }

    // Create new DM
    const docRef = await addDoc(dmsRef, {
      participants: sortedParticipants,
      createdAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      participants: sortedParticipants,
      createdAt: Date.now(),
    }
  } catch (error: any) {
    console.error("Error creating or getting direct message:", error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to create/get direct message. Using local storage fallback.")
    }
    return null
  }
}

// Users
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)

    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName || data.email,
        avatar: data.avatar,
        isAdmin: data.isAdmin || false,
        isOnline: data.isOnline || false,
      }
    })
  } catch (error: any) {
    console.error("Error getting users:", error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to access users collection. Using local storage fallback.")
    }
    return []
  }
}

export const createOrUpdateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(userRef, userData, { merge: true })
    return true
  } catch (error: any) {
    console.error(`Error creating/updating user ${userId}:`, error)
    // Check if the error is due to permission issues
    if (error.code === "permission-denied") {
      console.warn("Insufficient permissions to create/update user. Using local storage fallback.")
    }
    return false
  }
}
