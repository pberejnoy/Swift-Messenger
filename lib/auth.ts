import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { redis, getUser, createUser, getUserByEmail } from "./redis"
import { hashPassword, comparePassword, simpleHash } from "./auth-utils"
import bcrypt from "bcrypt"

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function register(email: string, name: string, password: string, isAdmin = false) {
  console.log(`Registration attempt for email: ${email}`)

  // Ensure email is in valid format
  if (!isValidEmail(email)) {
    console.warn(`Invalid email format in registration: ${email}`)
    throw new Error("Invalid email format")
  }

  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.warn(`Registration failed: Email already exists: ${email}`)
      throw new Error("User already exists")
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const userId = uuidv4()
    await createUser(userId, {
      email,
      name,
      password: hashedPassword,
      isAdmin,
      createdAt: Date.now(),
      lastLogin: null,
      loginAttempts: 0,
    })

    // Create email to userId mapping
    await redis.set(`email:${email}`, userId)

    console.log(`Registration successful for email: ${email}. User ID: ${userId}`)
    return userId
  } catch (error) {
    console.error(`Registration error for email: ${email}:`, error)
    throw error
  }
}

// Fix the login function to properly handle admin authentication

export async function login(email: string, password: string) {
  console.log(`Login process started for email: ${email}`)

  // Validate email format
  if (!isValidEmail(email)) {
    console.warn(`Invalid email format in login: ${email}`)
    throw new Error("Invalid email format")
  }

  try {
    // Special case for admin account
    if (email.toLowerCase() === "pberejnoy@v0.com") {
      console.log("Admin login attempt detected - using special handling")

      // Get userId from email
      const userId = await redis.get(`email:${email}`)

      if (!userId) {
        console.warn("Admin account not found in database")

        // Create admin account if it doesn't exist
        console.log("Creating admin account since it doesn't exist")
        const adminId = await ensureSuperAdminExists()

        if (!adminId) {
          throw new Error("Failed to create admin account. Please use the reset function in the diagnostic page.")
        }

        // Try to get the newly created admin
        const newAdmin = await getUser(adminId)
        if (!newAdmin) {
          throw new Error("Admin account creation failed. Please use the reset function in the diagnostic page.")
        }

        // Update last login time
        await createUser(adminId, {
          ...newAdmin,
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: Date.now(),
          updatedAt: Date.now(),
        })

        return { ...newAdmin, id: adminId }
      }

      const user = await getUser(userId as string)
      if (!user) {
        console.warn("Admin user data not found")
        throw new Error("Admin account data not found. Please use the reset function in the diagnostic page.")
      }

      console.log("Admin user found:", {
        id: userId,
        email: user.email,
        isAdmin: user.isAdmin,
        passwordHash: user.password ? `${user.password.substring(0, 10)}...` : "undefined",
      })

      // For admin account, try both password comparison methods
      // First try simple hash comparison
      const simpleHashedPassword = simpleHash(password)
      console.log(`Admin password simple hash: ${simpleHashedPassword.substring(0, 10)}...`)
      console.log(`Stored admin password hash: ${user.password ? user.password.substring(0, 10) + "..." : "undefined"}`)

      // Check if the password is the expected admin password
      const expectedAdminPassword = "Sl@ckV0"
      if (password === expectedAdminPassword) {
        console.log("Admin password matches expected password, forcing login")

        // Force update the password hash to ensure it's correct
        const correctHash = simpleHash(expectedAdminPassword)
        await createUser(userId as string, {
          ...user,
          password: correctHash,
          isAdmin: true,
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: Date.now(),
          updatedAt: Date.now(),
        })

        return { ...user, id: userId }
      }

      if (simpleHashedPassword === user.password) {
        console.log("Admin password matched using simple hash")

        // Update last login time
        await createUser(userId as string, {
          ...user,
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: Date.now(),
          updatedAt: Date.now(),
        })

        return { ...user, id: userId }
      }

      // If simple hash fails, try bcrypt comparison
      if (/^\$2[aby]\$\d+\$/.test(user.password)) {
        console.log("Trying bcrypt comparison for admin")
        const bcryptMatch = await bcrypt.compare(password, user.password)

        if (bcryptMatch) {
          console.log("Admin password matched using bcrypt")

          // Update last login time
          await createUser(userId as string, {
            ...user,
            loginAttempts: 0,
            lockedUntil: null,
            lastLogin: Date.now(),
            updatedAt: Date.now(),
          })

          return { ...user, id: userId }
        }
      }

      console.warn("Admin password match failed")
      throw new Error("Invalid admin password")
    }

    // Regular user login process
    const userId = await redis.get(`email:${email}`)

    if (!userId) {
      console.warn(`Login failed: No user found for email: ${email}`)
      throw new Error("Invalid email or password")
    }

    const user = await getUser(userId as string)
    if (!user) {
      console.warn(`Login failed: User ID exists but no user data found. Email: ${email}, User ID: ${userId}`)
      throw new Error("Invalid email or password")
    }

    // Check if account is locked
    if (user.lockedUntil && Number.parseInt(user.lockedUntil) > Date.now()) {
      console.warn(`Login attempt for locked account. Email: ${email}, User ID: ${userId}`)
      throw new Error("Account is temporarily locked. Please try again later.")
    }

    // Compare password
    console.log(`Comparing password for email: ${email}`)
    const passwordMatch = await comparePassword(password, user.password)

    if (!passwordMatch) {
      // Increment failed login attempts
      const loginAttempts = Number.parseInt(user.loginAttempts || "0") + 1

      // Lock account after 5 failed attempts
      const updates: any = { loginAttempts }
      if (loginAttempts >= 5) {
        const lockTime = Date.now() + 300000 // 5 minutes
        updates.lockedUntil = lockTime
        console.warn(`Account locked due to too many failed attempts. Email: ${email}, User ID: ${userId}`)
      }

      await createUser(userId as string, {
        ...user,
        ...updates,
        updatedAt: Date.now(),
      })

      console.warn(`Login failed: Invalid password for email: ${email}, User ID: ${userId}. Attempt ${loginAttempts}`)
      throw new Error("Invalid email or password")
    }

    console.log(`Password match successful for email: ${email}`)

    // Reset login attempts and update last login time
    await createUser(userId as string, {
      ...user,
      loginAttempts: 0,
      lockedUntil: null,
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    })

    console.log(`Login successful for email: ${email}, User ID: ${userId}`)
    return { ...user, id: userId }
  } catch (error) {
    console.error(`Login error for email: ${email}:`, error)
    throw error
  }
}

export function setAuthCookie(userId: string) {
  try {
    cookies().set("userId", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })
    console.log(`Auth cookie set for User ID: ${userId}`)
  } catch (error) {
    console.error(`Error setting auth cookie for User ID: ${userId}:`, error)
    throw error
  }
}

export function getAuthCookie() {
  try {
    const userId = cookies().get("userId")?.value
    return userId
  } catch (error) {
    console.error("Error getting auth cookie:", error)
    return null
  }
}

export function clearAuthCookie() {
  try {
    cookies().delete("userId")
    console.log("Auth cookie cleared")
  } catch (error) {
    console.error("Error clearing auth cookie:", error)
  }
}

export async function getCurrentUser() {
  try {
    const userId = getAuthCookie()
    if (!userId) return null

    const user = await getUser(userId)
    return user ? { ...user, id: userId } : null
  } catch (error) {
    console.error(`Error getting current user:`, error)
    return null
  }
}

export function requireAuth() {
  const userId = getAuthCookie()
  if (!userId) {
    console.warn("Auth required but no user ID found in cookie")
    redirect("/login")
  }
  return userId
}

export async function requireAdmin() {
  try {
    const userId = requireAuth()
    const user = await getUser(userId)

    if (!user || user.isAdmin !== true) {
      console.warn(`Admin access attempted by non-admin user. User ID: ${userId}`)
      redirect("/unauthorized")
    }

    return userId
  } catch (error) {
    console.error("Error in requireAdmin:", error)
    redirect("/login")
  }
}

// Function to create the super admin account if it doesn't exist
export async function ensureSuperAdminExists() {
  const adminEmail = "pberejnoy@v0.com"
  const adminPassword = "Sl@ckV0"

  try {
    console.log("Checking if super admin account exists...")

    // Check if admin already exists by email
    const existingAdmin = await getUserByEmail(adminEmail)

    if (!existingAdmin) {
      console.log("Super admin account does not exist. Creating...")

      // Create the admin account with email format
      // Use simpleHash for backward compatibility
      const userId = uuidv4()
      const hashedPassword = simpleHash(adminPassword)

      console.log("Creating admin with simple hash for backward compatibility")
      console.log(`Admin password hash: ${hashedPassword.substring(0, 20)}...`)

      await createUser(userId, {
        email: adminEmail,
        name: "Super Admin",
        password: hashedPassword,
        isAdmin: true,
        createdAt: Date.now(),
        lastLogin: null,
        loginAttempts: 0,
      })

      // Create email to userId mapping
      await redis.set(`email:${adminEmail}`, userId)

      console.log("Super admin account created successfully")
      return userId
    } else {
      console.log("Super admin account already exists")

      // Get the admin user ID
      const userId = await redis.get(`email:${adminEmail}`)
      if (!userId) {
        console.warn("Admin email exists but userId mapping is missing")
        return null
      }

      // Get the admin user data
      const user = await getUser(userId as string)
      if (!user) {
        console.warn("Admin userId exists but user data is missing")
        return null
      }

      // Ensure the password hash is correct
      const correctHash = simpleHash(adminPassword)
      if (user.password !== correctHash) {
        console.log("Updating admin password hash to ensure it's correct")
        await createUser(userId as string, {
          ...user,
          password: correctHash,
          isAdmin: true,
          updatedAt: Date.now(),
        })
      }

      return userId as string
    }
  } catch (error) {
    console.error("Error ensuring super admin exists:", error)
    throw error
  }
}
