import { routes } from "../routing/routes"

/**
 * Safely navigate to a channel page
 * @param channelId - The ID of the channel to navigate to
 * @returns The URL path for the channel
 */
export function getChannelPath(channelId: string): string {
  try {
    // Try to use the routes object first
    if (routes?.protected?.channels?.view) {
      return routes.protected.channels.view(channelId)
    }
    // Fall back to direct string path if routes object is not available
    return `/channels/${channelId}`
  } catch (error) {
    console.warn("Error getting channel path from routes object:", error)
    // Fall back to direct string path
    return `/channels/${channelId}`
  }
}

/**
 * Safely navigate to a direct message page
 * @param userId - The ID of the user to navigate to
 * @returns The URL path for the direct message
 */
export function getDirectMessagePath(userId: string): string {
  try {
    // Try to use the routes object first
    if (routes?.protected?.directMessages?.view) {
      return routes.protected.directMessages.view(userId)
    }
    // Fall back to direct string path if routes object is not available
    return `/direct-messages/${userId}`
  } catch (error) {
    console.warn("Error getting direct message path from routes object:", error)
    // Fall back to direct string path
    return `/direct-messages/${userId}`
  }
}

/**
 * Get a safe route path
 * @param routePath - The path in the routes object (e.g., "protected.dashboard")
 * @param fallback - The fallback path to use if the route is not found
 * @returns The URL path
 */
export function getSafePath(routePath: string, fallback: string): string {
  try {
    // Split the path into parts
    const parts = routePath.split(".")

    // Navigate through the routes object
    let current: any = routes
    for (const part of parts) {
      if (current[part] === undefined) {
        return fallback
      }
      current = current[part]
    }

    // If the result is a function, it's a dynamic route that needs parameters
    if (typeof current === "function") {
      console.warn("Cannot use getSafePath for dynamic routes that require parameters")
      return fallback
    }

    // If the result is a string, it's a valid route
    if (typeof current === "string") {
      return current
    }

    // Otherwise, fall back
    return fallback
  } catch (error) {
    console.warn("Error getting safe path:", error)
    return fallback
  }
}
