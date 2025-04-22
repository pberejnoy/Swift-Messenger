import type { User } from "@/lib/types"

// Keys for localStorage
const STORAGE_KEYS = {
  MESSAGES: "swift_messages",
  CHANNELS: "swift_channels",
  DMS: "swift_dms",
  DM_MESSAGES: "swift_dm_messages",
  USERS: "swift_users",
  CURRENT_USER: "currentUser",
  AUTH_TOKEN: "authToken",
}

// Helper function to safely parse JSON
function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return defaultValue
  }
}

// Helper function to safely stringify JSON
function safeJsonStringify(data: any): string {
  try {
    return JSON.stringify(data)
  } catch (error) {
    console.error("Error stringifying JSON:", error)
    return "{}"
  }
}

// Helper function to safely access localStorage
function safeLocalStorage(operation: "get" | "set" | "remove", key: string, value?: string): string | null {
  try {
    if (operation === "get") {
      return localStorage.getItem(key)
    } else if (operation === "set" && value !== undefined) {
      localStorage.setItem(key, value)
      return null
    } else if (operation === "remove") {
      localStorage.removeItem(key)
      return null
    }
    return null
  } catch (error) {
    console.error(`Error accessing localStorage (${operation} ${key}):`, error)
    return null
  }
}

// Save users to localStorage
export function saveUsers(users: User[]): void {
  safeLocalStorage("set", STORAGE_KEYS.USERS, safeJsonStringify(users))
}

// Load users from localStorage
export function loadUsers(): User[] {
  return safeJsonParse<User[]>(safeLocalStorage("get", STORAGE_KEYS.USERS), [])
}

// Save current user to localStorage
export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  } catch (error) {
    console.error("Error saving current user to localStorage:", error)
  }
}

// Load current user from localStorage
export function loadCurrentUser(): User | null {
  try {
    const storedUserJSON = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return safeJsonParse(storedUserJSON, null)
  } catch (error) {
    console.error("Error loading current user from localStorage:", error)
    return null
  }
}

// Save auth token to localStorage
export function saveAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    }
  } catch (error) {
    console.error("Error saving auth token to localStorage:", error)
  }
}

// Load auth token from localStorage
export function loadAuthToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  } catch (error) {
    console.error("Error loading auth token from localStorage:", error)
    return null
  }
}

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Initialize default data for the application
export function initializeDefaultData(): void {
  try {
    // Check if users exist in localStorage
    let users = loadUsers()
    if (users.length === 0) {
      // Initialize with default users
      users = [
        {
          id: "user1",
          email: "john.doe@example.com",
          displayName: "John Doe",
          avatar: "/thoughtful-spectacled-man.png",
          isOnline: true,
          status: "online",
        },
        {
          id: "user2",
          email: "jane.smith@example.com",
          displayName: "Jane Smith",
          avatar: "/thoughtful-brunette.png",
          isOnline: true,
          status: "away",
        },
        {
          id: "admin1",
          email: "admin@example.com",
          displayName: "Admin User",
          isAdmin: true,
          isOnline: true,
          status: "online",
        },
        {
          id: "admin2",
          email: "pberejnoy@v0.com",
          displayName: "Pavel Berejnoy",
          isAdmin: true,
          isOnline: true,
          status: "online",
        },
      ]
      saveUsers(users)
      console.log("Initialized default users")
    }

    console.log("Default data initialization complete")
  } catch (error) {
    console.error("Error initializing default data:", error)
  }
}
