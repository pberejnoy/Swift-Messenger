/**
 * Safely gets the first character of a string, with a fallback
 */
export function getFirstCharacter(str: string | undefined | null, fallback = "U"): string {
  if (!str || typeof str !== "string" || str.length === 0) {
    return fallback
  }
  return str.charAt(0)
}

/**
 * Gets initials from a name or email
 */
export function getInitials(name: string | undefined | null, fallback = "U"): string {
  if (!name || typeof name !== "string" || name.length === 0) {
    return fallback
  }

  // If it's an email, use the first character before the @ symbol
  if (name.includes("@")) {
    return name.split("@")[0].charAt(0).toUpperCase()
  }

  // For names, get first character of each word
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fallback

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  // First character of first and last word
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
