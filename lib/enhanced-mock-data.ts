import { v4 as uuidv4 } from "uuid"
import type { MockUser, MockChannel, MockMessage } from "./mock-data-service"

// Function to generate a random date within the last 30 days
function randomDate(daysAgo = 30) {
  const now = Date.now()
  const thirtyDaysAgo = now - daysAgo * 24 * 60 * 60 * 1000
  return thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo)
}

// Function to generate a random number of reactions for a message
function generateRandomReactions(userIds: string[]) {
  const reactions = []
  const reactionTypes = ["👍", "❤️", "😂", "😮", "🎉", "🔥", "👀", "🙌"]

  // Randomly decide how many reactions to add (0-3)
  const numReactions = Math.floor(Math.random() * 4)

  for (let i = 0; i < numReactions; i++) {
    // Randomly select a user
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    // Randomly select a reaction type
    const reaction = reactionTypes[Math.floor(Math.random() * reactionTypes.length)]

    reactions.push({ userId, reaction })
  }

  return reactions
}

// Function to generate thread replies for a message
function generateThreadReplies(messageId: string, channelId: string, userIds: string[], count = 0) {
  if (count === 0) {
    // Randomly decide if this message has thread replies (20% chance)
    if (Math.random() > 0.2) return []
    count = Math.floor(Math.random() * 5) + 1 // 1-5 replies
  }

  const replies = []

  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    const createdAt = randomDate(7) // Within the last week

    replies.push({
      id: uuidv4(),
      content: `This is a thread reply #${i + 1} to message ${messageId}`,
      userId,
      channelId,
      parentMessageId: messageId,
      createdAt,
      reactions: generateRandomReactions(userIds),
    })
  }

  return replies
}

// Function to generate a comprehensive set of mock data
export function generateEnhancedMockData() {
  // Users
  const users: MockUser[] = [
    {
      id: "user1",
      email: "john.doe@example.com",
      displayName: "John Doe",
      avatar: "/thoughtful-spectacled-man.png",
      status: "online",
      isOnline: true,
    },
    {
      id: "user2",
      email: "jane.smith@example.com",
      displayName: "Jane Smith",
      avatar: "/thoughtful-brunette.png",
      status: "away",
      isOnline: true,
    },
    {
      id: "user3",
      email: "alex.johnson@example.com",
      displayName: "Alex Johnson",
      avatar: "/sunlit-blonde.png",
      status: "offline",
      isOnline: false,
    },
    {
      id: "user4",
      email: "sam.wilson@example.com",
      displayName: "Sam Wilson",
      avatar: "/fiery-portrait.png",
      status: "busy",
      isOnline: true,
    },
    {
      id: "user5",
      email: "taylor.chen@example.com",
      displayName: "Taylor Chen",
      avatar: "/contemplative-youth.png",
      status: "online",
      isOnline: true,
    },
  ]

  const userIds = users.map((user) => user.id)

  // Channels
  const channels: MockChannel[] = [
    {
      id: "general",
      name: "general",
      description: "General discussions and announcements",
      isPrivate: false,
      createdBy: "user1",
      participants: userIds,
      createdAt: randomDate(60), // Created within the last 60 days
    },
    {
      id: "random",
      name: "random",
      description: "Random topics and fun conversations",
      isPrivate: false,
      createdBy: "user2",
      participants: ["user1", "user2", "user3", "user5"],
      createdAt: randomDate(45), // Created within the last 45 days
    },
    {
      id: "development",
      name: "development",
      description: "Development discussions and technical topics",
      isPrivate: true,
      createdBy: "user1",
      participants: ["user1", "user4", "user5"],
      createdAt: randomDate(30), // Created within the last 30 days
    },
    {
      id: "design",
      name: "design",
      description: "Design discussions and inspiration",
      isPrivate: false,
      createdBy: "user5",
      participants: ["user1", "user2", "user5"],
      createdAt: randomDate(20), // Created within the last 20 days
    },
    {
      id: "marketing",
      name: "marketing",
      description: "Marketing strategies and campaigns",
      isPrivate: false,
      createdBy: "user3",
      participants: ["user1", "user3", "user5"],
      createdAt: randomDate(15), // Created within the last 15 days
    },
  ]

  // Generate messages for each channel
  const messages: Record<string, MockMessage[]> = {}
  const threadReplies: MockMessage[] = []

  channels.forEach((channel) => {
    const channelMessages: MockMessage[] = []
    const messageCount = Math.floor(Math.random() * 20) + 10 // 10-30 messages per channel

    for (let i = 0; i < messageCount; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)]
      const messageId = uuidv4()
      const createdAt = randomDate()

      const message: MockMessage = {
        id: messageId,
        content: `Message #${i + 1} in ${channel.name} channel: ${Math.random().toString(36).substring(2, 15)}`,
        userId,
        channelId: channel.id,
        createdAt,
        reactions: generateRandomReactions(userIds),
      }

      // Generate thread replies for this message
      const replies = generateThreadReplies(messageId, channel.id, userIds)
      if (replies.length > 0) {
        message.threadCount = replies.length
        threadReplies.push(...replies)
      }

      channelMessages.push(message)
    }

    // Sort messages by creation date
    channelMessages.sort((a, b) => a.createdAt - b.createdAt)
    messages[channel.id] = channelMessages
  })

  // Generate direct messages between users
  const directMessages: Record<string, MockMessage[]> = {}

  // Generate DMs between each pair of users
  for (let i = 0; i < userIds.length; i++) {
    for (let j = i + 1; j < userIds.length; j++) {
      const user1 = userIds[i]
      const user2 = userIds[j]
      const dmId = `dm:${user1}:${user2}`

      const dmMessages: MockMessage[] = []
      // 50% chance of having DMs between these users
      if (Math.random() > 0.5) {
        const messageCount = Math.floor(Math.random() * 10) + 5 // 5-15 messages

        for (let k = 0; k < messageCount; k++) {
          const userId = Math.random() > 0.5 ? user1 : user2 // Randomly choose sender
          const messageId = uuidv4()
          const createdAt = randomDate()

          dmMessages.push({
            id: messageId,
            content: `DM #${k + 1} from ${userId}: ${Math.random().toString(36).substring(2, 15)}`,
            userId,
            dmId,
            createdAt,
            reactions: generateRandomReactions([user1, user2]),
          })
        }

        // Sort messages by creation date
        dmMessages.sort((a, b) => a.createdAt - b.createdAt)
        directMessages[dmId] = dmMessages
      }
    }
  }

  return {
    users,
    channels,
    messages,
    directMessages,
    threadReplies,
  }
}

// Function to inject enhanced mock data into the mock data service
export function injectEnhancedMockData(mockDataService: any) {
  const enhancedData = generateEnhancedMockData()

  // Replace the mock data in the service
  mockDataService._users = enhancedData.users
  mockDataService._channels = enhancedData.channels
  mockDataService._messages = enhancedData.messages
  mockDataService._directMessages = enhancedData.directMessages

  // Add thread replies to the appropriate collections
  enhancedData.threadReplies.forEach((reply) => {
    if (reply.channelId && reply.parentMessageId) {
      if (!mockDataService._threadReplies) {
        mockDataService._threadReplies = {}
      }
      if (!mockDataService._threadReplies[reply.parentMessageId]) {
        mockDataService._threadReplies[reply.parentMessageId] = []
      }
      mockDataService._threadReplies[reply.parentMessageId].push(reply)
    }
  })

  console.log("Enhanced mock data injected:", {
    users: enhancedData.users.length,
    channels: enhancedData.channels.length,
    messages: Object.values(enhancedData.messages).flat().length,
    directMessages: Object.values(enhancedData.directMessages).flat().length,
    threadReplies: enhancedData.threadReplies.length,
  })

  return enhancedData
}
