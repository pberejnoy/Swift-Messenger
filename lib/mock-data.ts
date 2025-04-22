import type { User, Channel, Message, Thread } from "@/lib/types"

// Generate a random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Save data to localStorage
export function saveDataToLocalStorage(data: any) {
  try {
    localStorage.setItem("swift_data", JSON.stringify(data))
  } catch (error) {
    console.error("Error saving data to localStorage:", error)
  }
}

// Load data from localStorage
export function loadDataFromLocalStorage() {
  try {
    const data = localStorage.getItem("swift_data")
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Error loading data from localStorage:", error)
    return null
  }
}

// Generate initial data for the app
export function generateInitialData() {
  // Create users
  const users: Record<string, User> = {
    user1: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      avatar: "/thoughtful-spectacled-man.png",
      status: "online",
      role: "admin",
    },
    user2: {
      id: "user2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      avatar: "/thoughtful-brunette.png",
      status: "away",
    },
    user3: {
      id: "user3",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      avatar: "/sunlit-blonde.png",
      status: "offline",
    },
    user4: {
      id: "user4",
      name: "Sam Wilson",
      email: "sam.wilson@example.com",
      avatar: "/fiery-portrait.png",
      status: "busy",
    },
    user5: {
      id: "user5",
      name: "Taylor Chen",
      email: "taylor.chen@example.com",
      avatar: "/contemplative-youth.png",
      status: "online",
    },
  }

  // Create channels
  const channels: Record<string, Channel> = {
    channel1: {
      id: "channel1",
      name: "general",
      description: "General discussion",
      isPrivate: false,
      createdBy: "user1",
      members: ["user1", "user2", "user3", "user4", "user5"],
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      updatedAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    },
    channel2: {
      id: "channel2",
      name: "random",
      description: "Random stuff",
      isPrivate: false,
      createdBy: "user2",
      members: ["user1", "user2", "user3", "user5"],
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      updatedAt: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
    },
    channel3: {
      id: "channel3",
      name: "development",
      description: "Development discussions",
      isPrivate: true,
      createdBy: "user1",
      members: ["user1", "user4", "user5"],
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      updatedAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    },
  }

  // Create messages
  const messages: Record<string, Message> = {
    message1: {
      id: "message1",
      channelId: "channel1",
      userId: "user1",
      content: "Welcome to the general channel!",
      reactions: [
        { id: "reaction1", userId: "user2", emoji: "👍", createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
        { id: "reaction2", userId: "user3", emoji: "🎉", createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
      ],
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      threadCount: 2,
    },
    message2: {
      id: "message2",
      channelId: "channel1",
      userId: "user2",
      content: "Thanks for having me!",
      reactions: [],
      createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000, // 6 days ago
      updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    },
    message3: {
      id: "message3",
      channelId: "channel1",
      userId: "user3",
      content: "Hey everyone, how's it going?",
      reactions: [{ id: "reaction3", userId: "user1", emoji: "👋", createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 }],
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    message4: {
      id: "message4",
      channelId: "channel1",
      userId: "user1",
      threadId: "message1",
      content: "This is a thread reply to the welcome message",
      reactions: [],
      createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 + 1000, // Just after message1
      updatedAt: Date.now() - 6 * 24 * 60 * 60 * 1000 + 1000,
    },
    message5: {
      id: "message5",
      channelId: "channel1",
      userId: "user4",
      threadId: "message1",
      content: "Another reply in the thread",
      reactions: [],
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + 2000, // After message4
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + 2000,
    },
    message6: {
      id: "message6",
      channelId: "channel2",
      userId: "user2",
      content: "Hello random channel!",
      reactions: [],
      createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    },
    message7: {
      id: "message7",
      channelId: "channel2",
      userId: "user3",
      content: "What should we talk about here?",
      reactions: [{ id: "reaction4", userId: "user5", emoji: "🤔", createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 }],
      createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    },
    message8: {
      id: "message8",
      channelId: "channel3",
      userId: "user1",
      content: "Let's discuss the new project architecture",
      reactions: [],
      createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    message9: {
      id: "message9",
      channelId: "channel3",
      userId: "user4",
      content: "I think we should use Next.js for the frontend",
      reactions: [{ id: "reaction5", userId: "user1", emoji: "👍", createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 }],
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    message10: {
      id: "message10",
      channelId: "channel1",
      userId: "user5",
      content: "Has anyone seen the latest updates to the docs?",
      reactions: [],
      createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
  }

  // Create threads
  const threads: Record<string, Thread> = {
    message1: {
      id: "message1",
      channelId: "channel1",
      participantIds: ["user1", "user4"],
      messageCount: 2,
      lastReplyAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + 2000,
    },
  }

  return {
    users,
    channels,
    messages,
    threads,
  }
}
