import { redis, getUser } from "./redis"

// Function to migrate existing users to email format
export async function migrateUsersToEmailFormat() {
  try {
    console.log("Starting user migration to email format...")

    // Get all user IDs
    const userKeys = await redis.keys("user:*")
    const userIds = userKeys.map((key) => key.split(":")[1])

    let migratedCount = 0

    // Process each user
    for (const userId of userIds) {
      const user = await getUser(userId)

      if (user && !user.email) {
        // Get the original identifier used for this user
        const identifierKeys = await redis.keys("email:*")

        for (const key of identifierKeys) {
          const id = await redis.get(key)

          if (id === userId) {
            const originalIdentifier = key.split(":")[1]

            // Create an email format for this user
            const email = `${originalIdentifier}@messaging-app.com`

            // Update user with email
            await redis.hset(`user:${userId}`, {
              ...user,
              email,
              updatedAt: Date.now(),
            })

            // Create new email mapping
            await redis.set(`email:${email}`, userId)

            migratedCount++
            console.log(`Migrated user ${originalIdentifier} to ${email}`)
            break
          }
        }
      }
    }

    console.log(`Migration complete. ${migratedCount} users migrated to email format.`)
  } catch (error) {
    console.error("Error during user migration:", error)
  }
}
