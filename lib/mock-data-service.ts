import { v4 as uuidv4 } from "uuid"
// Import the enhanced mock data generator
import { generateEnhancedMockData } from "./enhanced-mock-data"

// Define types for mock data
export interface MockUser {
  id: string
  email: string
  displayName?: string
  name?: string
  avatar?: string
  status?: string
  isOnline?: boolean
  isAdmin?: boolean
}

export interface MockChannel {
  id: string
  name: string
  description?: string
  isPrivate: boolean
  createdBy: string
  members?: string[]
  participants: string[]
  createdAt: number
}

export interface MockMessage {
  id: string
  content: string
  userId: string
  channelId?: string
  dmId?: string
  parentMessageId?: string
  createdAt: number
  reactions: Array<{ userId: string; reaction: string }>
  threadCount?: number
}

// Initialize with enhanced mock data
const enhancedData = generateEnhancedMockData()
const mockUsers = enhancedData.users
const mockChannels = enhancedData.channels
const mockMessages = enhancedData.messages
const mockDirectMessages = enhancedData.directMessages
const mockThreadReplies = {}

// Organize thread replies by parent message ID
enhancedData.threadReplies.forEach((reply) => {
  if (reply.parentMessageId) {
    if (!mockThreadReplies[reply.parentMessageId]) {
      mockThreadReplies[reply.parentMessageId] = []
    }
    mockThreadReplies[reply.parentMessageId].push(reply)
  }
})

// Mock users with realistic data
// const mockUsers: MockUser[] = [
//   {
//     id: "user1",
//     email: "john.doe@example.com",
//     displayName: "John Doe",
//     avatar: "/thoughtful-spectacled-man.png",
//     status: "online",
//     isOnline: true,
//   },
//   {
//     id: "user2",
//     email: "jane.smith@example.com",
//     displayName: "Jane Smith",
//     avatar: "/thoughtful-brunette.png",
//     status: "away",
//     isOnline: true,
//   },
//   {
//     id: "user3",
//     email: "alex.johnson@example.com",
//     displayName: "Alex Johnson",
//     avatar: "/sunlit-blonde.png",
//     status: "offline",
//     isOnline: false,
//   },
//   {
//     id: "user4",
//     email: "sam.wilson@example.com",
//     displayName: "Sam Wilson",
//     avatar: "/fiery-portrait.png",
//     status: "busy",
//     isOnline: true,
//   },
//   {
//     id: "user5",
//     email: "taylor.chen@example.com",
//     displayName: "Taylor Chen",
//     avatar: "/contemplative-youth.png",
//     status: "online",
//     isOnline: true,
//   },
//   {
//     id: "admin1",
//     email: "admin@example.com",
//     displayName: "Admin User",
//     isAdmin: true,
//     isOnline: true,
//     status: "online",
//   },
//   {
//     id: "admin2",
//     email: "pberejnoy@v0.com",
//     displayName: "Pavel Berejnoy",
//     isAdmin: true,
//     isOnline: true,
//     status: "online",
//   },
// ]

// Mock channels with realistic data
// const mockChannels: MockChannel[] = [
//   {
//     id: "general",
//     name: "general",
//     description: "General discussions and announcements",
//     isPrivate: false,
//     createdBy: "user1",
//     participants: ["user1", "user2", "user3", "user4", "user5"],
//     createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
//   },
//   {
//     id: "random",
//     name: "random",
//     description: "Random topics and fun conversations",
//     isPrivate: false,
//     createdBy: "user2",
//     participants: ["user1", "user2", "user3", "user5"],
//     createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000, // 25 days ago
//   },
//   {
//     id: "development",
//     name: "development",
//     description: "Development discussions and technical topics",
//     isPrivate: true,
//     createdBy: "user1",
//     participants: ["user1", "user4", "user5"],
//     createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
//   },
// ]

// Mock messages for channels
// const mockMessages: Record<string, MockMessage[]> = {
//   general: [
//     {
//       id: "msg1",
//       content: "Welcome to the general channel!",
//       userId: "user1",
//       channelId: "general",
//       createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
//       reactions: [
//         { userId: "user2", reaction: "👍" },
//         { userId: "user3", reaction: "🎉" },
//       ],
//     },
//     {
//       id: "msg2",
//       content: "Thanks for having me!",
//       userId: "user2",
//       channelId: "general",
//       createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//     {
//       id: "msg3",
//       content: "Hey everyone, how's it going?",
//       userId: "user3",
//       channelId: "general",
//       createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
//       reactions: [{ userId: "user1", reaction: "👋" }],
//     },
//     {
//       id: "msg10",
//       content: "Has anyone seen the latest updates to the docs?",
//       userId: "user5",
//       channelId: "general",
//       createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
//       reactions: [],
//     },
//   ],
//   random: [
//     {
//       id: "msg4",
//       content: "Did anyone watch the game last night?",
//       userId: "user2",
//       channelId: "random",
//       createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//     {
//       id: "msg5",
//       content: "Yes! What an amazing finish!",
//       userId: "user1",
//       channelId: "random",
//       createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 + 1000 * 60 * 15, // 15 minutes later
//       reactions: [],
//     },
//     {
//       id: "msg11",
//       content: "I'm thinking of starting a new hobby. Any suggestions?",
//       userId: "user3",
//       channelId: "random",
//       createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//   ],
//   development: [
//     {
//       id: "msg6",
//       content: "We need to decide on a framework for the new project. Thoughts?",
//       userId: "user1",
//       channelId: "development",
//       createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//     {
//       id: "msg7",
//       content: "I'd recommend Next.js for this type of application.",
//       userId: "user4",
//       channelId: "development",
//       createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000 * 60 * 20, // 20 minutes later
//       reactions: [{ userId: "user1", reaction: "👍" }],
//     },
//     {
//       id: "msg8",
//       content: "What about using TypeScript?",
//       userId: "user5",
//       channelId: "development",
//       createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//   ],
// }

// Mock direct messages
// const mockDirectMessages: Record<string, MockMessage[]> = {
//   "dm:user1:user2": [
//     {
//       id: "dm1",
//       content: "Hey Jane, how's the project going?",
//       userId: "user1",
//       dmId: "dm:user1:user2",
//       createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//     {
//       id: "dm2",
//       content: "It's coming along nicely, thanks for asking!",
//       userId: "user2",
//       dmId: "dm:user1:user2",
//       createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 + 1000 * 60 * 30, // 30 minutes later
//       reactions: [],
//     },
//   ],
//   "dm:user1:user3": [
//     {
//       id: "dm3",
//       content: "Hey Alex, can you help me with this issue?",
//       userId: "user1",
//       dmId: "dm:user1:user3",
//       createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
//       reactions: [],
//     },
//     {
//       id: "dm4",
//       content: "Sure, I'm on it!",
//       userId: "user3",
//       dmId: "dm:user1:user3",
//       createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 + 1000 * 60 * 10, // 10 minutes later
//       reactions: [],
//     },
//   ],
// }

// Mock data service
export const mockDataService = {
  // Get all users
  getUsers: (): MockUser[] => {
    return [...mockUsers]
  },

  // Get user by ID
  getUser: (userId: string): MockUser | undefined => {
    return mockUsers.find((user) => user.id === userId)
  },

  // Get all channels
  getChannels: (): MockChannel[] => {
    return [...mockChannels]
  },

  // Get channel by ID
  getChannel: (channelId: string): MockChannel | undefined => {
    return mockChannels.find((channel) => channel.id === channelId)
  },

  // Get messages for a channel
  getChannelMessages: (channelId: string): MockMessage[] => {
    return mockMessages[channelId] || []
  },

  // Get direct messages between two users
  getDirectMessages: (userId1: string, userId2: string): MockMessage[] => {
    const users = [userId1, userId2].sort()
    const dmId = `dm:${users[0]}:${users[1]}`
    return mockDirectMessages[dmId] || []
  },

  // Add a new message
  addMessage: (message: Omit<MockMessage, "id">): MockMessage => {
    const newMessage: MockMessage = {
      id: uuidv4(),
      ...message,
      reactions: message.reactions || [],
    }

    if (message.channelId) {
      // Add to channel messages
      if (!mockMessages[message.channelId]) {
        mockMessages[message.channelId] = []
      }
      mockMessages[message.channelId].push(newMessage)
    } else if (message.dmId) {
      // Add to direct messages
      if (!mockDirectMessages[message.dmId]) {
        mockDirectMessages[message.dmId] = []
      }
      mockDirectMessages[message.dmId].push(newMessage)
    }

    return newMessage
  },

  // Add a new channel
  addChannel: (channel: Omit<MockChannel, "id">): MockChannel => {
    const newChannel: MockChannel = {
      id: channel.name.toLowerCase().replace(/\s+/g, "-"),
      ...channel,
    }
    mockChannels.push(newChannel)
    return newChannel
  },

  // Add a reaction to a message
  addReaction: (messageId: string, userId: string, reaction: string): void => {
    // Find the message in all channels
    for (const channelId in mockMessages) {
      const messageIndex = mockMessages[channelId].findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        // Check if user already reacted with this emoji
        const existingReactionIndex = mockMessages[channelId][messageIndex].reactions.findIndex(
          (r) => r.userId === userId && r.reaction === reaction,
        )

        if (existingReactionIndex !== -1) {
          // Remove existing reaction
          mockMessages[channelId][messageIndex].reactions.splice(existingReactionIndex, 1)
        } else {
          // Add new reaction
          mockMessages[channelId][messageIndex].reactions.push({ userId, reaction })
        }
        return
      }
    }

    // Check direct messages
    for (const dmId in mockDirectMessages) {
      const messageIndex = mockDirectMessages[dmId].findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        // Check if user already reacted with this emoji
        const existingReactionIndex = mockDirectMessages[dmId][messageIndex].reactions.findIndex(
          (r) => r.userId === userId && r.reaction === reaction,
        )

        if (existingReactionIndex !== -1) {
          // Remove existing reaction
          mockDirectMessages[dmId][messageIndex].reactions.splice(existingReactionIndex, 1)
        } else {
          // Add new reaction
          mockDirectMessages[dmId][messageIndex].reactions.push({ userId, reaction })
        }
        return
      }
    }
  },

  // Edit a message
  editMessage: (messageId: string, content: string): void => {
    // Find the message in all channels
    for (const channelId in mockMessages) {
      const messageIndex = mockMessages[channelId].findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        mockMessages[channelId][messageIndex].content = content
        return
      }
    }

    // Check direct messages
    for (const dmId in mockDirectMessages) {
      const messageIndex = mockDirectMessages[dmId].findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        mockDirectMessages[dmId][messageIndex].content = content
        return
      }
    }
  },

  // Remove a message
  removeMessage: (messageId: string): void => {
    // Find the message in all channels
    for (const channelId in mockMessages) {
      const messageIndex = mockMessages[channelId].findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        mockMessages[channelId].splice(messageIndex, 1)
        return
      }
    }

    // Check direct messages
    for (const dmId in mockDirectMessages) {
      const messageIndex = mockDirectMessages[dmId].findIndex((msg) => msg.id === messageId)
      if (messageIndex !== -1) {
        mockDirectMessages[dmId].splice(messageIndex, 1)
        return
      }
    }
  },

  // Add user to channel
  addUserToChannel: (channelId: string, userId: string): void => {
    const channel = mockChannels.find((c) => c.id === channelId)
    if (channel && !channel.participants.includes(userId)) {
      channel.participants.push(userId)
    }
  },

  // Search messages
  searchMessages: (query: string): MockMessage[] => {
    const results: MockMessage[] = []
    const lowerQuery = query.toLowerCase()

    // Search in channel messages
    for (const channelId in mockMessages) {
      const matches = mockMessages[channelId].filter((msg) => msg.content.toLowerCase().includes(lowerQuery))
      results.push(...matches)
    }

    // Search in direct messages
    for (const dmId in mockDirectMessages) {
      const matches = mockDirectMessages[dmId].filter((msg) => msg.content.toLowerCase().includes(lowerQuery))
      results.push(...matches)
    }

    return results
  },

  // Get thread messages for a parent message
  getThreadMessages: (parentMessageId: string): MockMessage[] => {
    // Find the parent message
    let parentMessage: MockMessage | undefined

    // Look in channel messages
    for (const channelId in mockMessages) {
      const message = mockMessages[channelId].find((msg) => msg.id === parentMessageId)
      if (message) {
        parentMessage = message
        break
      }
    }

    // Look in direct messages if not found
    if (!parentMessage) {
      for (const dmId in mockDirectMessages) {
        const message = mockDirectMessages[dmId].find((msg) => msg.id === parentMessageId)
        if (message) {
          parentMessage = message
          break
        }
      }
    }

    if (!parentMessage) {
      return []
    }

    // Get thread replies
    const replies = mockThreadReplies[parentMessageId] || []

    // Return parent message followed by replies
    return [parentMessage, ...replies]
  },
}
