/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== "string") return ""
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Generates initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}
