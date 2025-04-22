import { redis, getUser, createUser } from "./redis"
import { simpleHash } from "./auth-utils"

// Function to fix the admin account password if it's using the wrong format
export async function fixAdminAccount() {
  const adminEmail = "pberejnoy@v0.com"
  const adminPassword = "Sl@ckV0"

  try {
    console.log("Checking admin account password format...")

    // Get the admin user
    const userId = await redis.get(`email:${adminEmail}`)

    if (!userId) {
      console.log("Admin account not found, nothing to fix")
      return false
    }

    const user = await getUser(userId as string)

    if (!user) {
      console.log("Admin user data not found, nothing to fix")
      return false
    }

    // Generate the correct hash
    const correctHash = simpleHash(adminPassword)

    console.log("Current password hash:", user.password ? user.password.substring(0, 20) + "..." : "undefined")
    console.log("Expected password hash:", correctHash.substring(0, 20) + "...")

    // Force update the password hash regardless of current value
    console.log("Forcing admin account password update...")

    // Update the user with the correct password hash
    await createUser(userId as string, {
      ...user,
      password: correctHash,
      isAdmin: true, // Ensure admin flag is set
      updatedAt: Date.now(),
      loginAttempts: 0,
      lockedUntil: null,
    })

    console.log("Admin account password format fixed")

    // Also clear any rate limits for this account
    const rateKeys = await redis.keys(`ratelimit:login:*`)
    for (const key of rateKeys) {
      await redis.del(key)
      console.log(`Deleted rate limit key: ${key}`)
    }

    // Clear failed attempts
    const failedAttemptsKeys = await redis.keys(`failedAttempts:*`)
    for (const key of failedAttemptsKeys) {
      await redis.del(key)
      console.log(`Deleted failed attempts key: ${key}`)
    }

    return true
  } catch (error) {
    console.error("Error fixing admin account:", error)
    return false
  }
}
