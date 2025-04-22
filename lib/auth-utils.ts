import crypto from "crypto"

// Simple hash function for passwords (for backward compatibility)
export function simpleHash(password: string): string {
  console.log(`Creating simple hash for password: ${password.substring(0, 3)}...`)

  // Ensure we're using the same encoding and hashing algorithm consistently
  const hash = crypto.createHash("sha256").update(password, "utf8").digest("hex")

  console.log(`Generated hash: ${hash.substring(0, 20)}...`)
  return hash
}

// Simple password hashing function using SHA-256
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve) => {
    // Use a fixed salt for simplicity in this demo
    const salt = "messaging-app-salt"
    const hash = crypto.createHash("sha256")
    hash.update(password + salt)
    resolve(hash.digest("hex"))
  })
}

// Compare a password with a hash, supporting both bcrypt and simple hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    // Verify password against stored hash
    const inputHash = await hashPassword(password)
    return inputHash === hash
  } catch (error) {
    console.error("Error comparing password:", error)
    throw new Error("Failed to verify password")
  }
}

// Check if a user is an admin
export function isAdmin(user: any): boolean {
  return user?.isAdmin === true
}

// Verify admin status and throw error if not admin
export function verifyAdmin(user: any): void {
  if (!isAdmin(user)) {
    throw new Error("Unauthorized: Admin access required")
  }
}
