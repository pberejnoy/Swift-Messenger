import { ensureSuperAdminExists } from "./auth"
import { fixAdminAccount } from "./auth-fix"

// This function will be called during app initialization
export async function initializeApp() {
  try {
    // Ensure the super admin account exists
    await ensureSuperAdminExists()

    // Fix admin account if needed
    await fixAdminAccount()

    console.log("App initialization completed successfully")
  } catch (error) {
    console.error("Error during app initialization:", error)
    // Don't rethrow the error to prevent app from crashing
  }
}
