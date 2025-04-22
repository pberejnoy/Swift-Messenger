import type { User } from "@/lib/types"
import {
  saveCurrentUser,
  loadCurrentUser,
  saveAuthToken,
  loadAuthToken,
  loadUsers,
  saveUsers,
} from "@/lib/storage-utils"

// Mock users for local authentication
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  "john.doe@example.com": {
    password: "password123",
    user: {
      id: "user1",
      email: "john.doe@example.com",
      displayName: "John Doe",
      avatar: "/thoughtful-spectacled-man.png",
      isOnline: true,
      status: "online",
    },
  },
  "jane.smith@example.com": {
    password: "password123",
    user: {
      id: "user2",
      email: "jane.smith@example.com",
      displayName: "Jane Smith",
      avatar: "/thoughtful-brunette.png",
      isOnline: true,
      status: "away",
    },
  },
  "admin@example.com": {
    password: "admin123",
    user: {
      id: "admin1",
      email: "admin@example.com",
      displayName: "Admin User",
      isAdmin: true,
      isOnline: true,
      status: "online",
    },
  },
  "pberejnoy@v0.com": {
    password: "Sl@ckV0",
    user: {
      id: "admin2",
      email: "pberejnoy@v0.com",
      displayName: "Pavel Berejnoy",
      isAdmin: true,
      isOnline: true,
      status: "online",
    },
  },
}

// Login function
export async function login(email: string, password: string): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const lowerEmail = email.toLowerCase().trim()
  const userRecord = MOCK_USERS[lowerEmail]

  // Check if user exists and password matches
  if (userRecord && userRecord.password === password) {
    // Generate a fake auth token
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Save user and token to localStorage
    saveCurrentUser(userRecord.user)
    saveAuthToken(token)

    // Make sure user exists in users list
    const users = loadUsers()
    if (!users.some((u) => u.id === userRecord.user.id)) {
      users.push(userRecord.user)
      saveUsers(users)
    }

    return userRecord.user
  }

  throw new Error("Invalid email or password")
}

// Register function
export async function register(name: string, email: string, password: string): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const lowerEmail = email.toLowerCase().trim()

  // Check if user already exists
  if (MOCK_USERS[lowerEmail]) {
    throw new Error("Email already in use")
  }

  // Create new user
  const userId = `user${Object.keys(MOCK_USERS).length + 1}`
  const newUser: User = {
    id: userId,
    email: lowerEmail,
    displayName: name,
    isOnline: true,
    status: "online",
  }

  // Add to mock users
  MOCK_USERS[lowerEmail] = {
    password,
    user: newUser,
  }

  // Generate a fake auth token
  const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  // Save user and token to localStorage
  saveCurrentUser(newUser)
  saveAuthToken(token)

  // Add to users list
  const users = loadUsers()
  users.push(newUser)
  saveUsers(users)

  return newUser
}

// Logout function
export async function logout(): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Clear user and token from localStorage
  saveCurrentUser(null)
  saveAuthToken(null)
}

// Get current user
export function getCurrentUser(): User | null {
  return loadCurrentUser()
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!loadAuthToken() && !!loadCurrentUser()
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const currentUser = loadCurrentUser()

  // Only allow updating own profile
  if (!currentUser || currentUser.id !== userId) {
    throw new Error("Unauthorized")
  }

  // Update user
  const updatedUser = {
    ...currentUser,
    ...profileData,
  }

  // Save updated user
  saveCurrentUser(updatedUser)

  // Update in users list
  const users = loadUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  if (userIndex >= 0) {
    users[userIndex] = updatedUser
    saveUsers(users)
  }

  return updatedUser
}
