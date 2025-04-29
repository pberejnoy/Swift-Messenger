/**
 * Formats a date as a string in the local date format
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString()
}

/**
 * Formats a time as a string in the local time format
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleTimeString()
}

/**
 * Formats a date and time as a string in the local format
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  return `${formatDate(d)} ${formatTime(d)}`
}

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string | number): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffSec < 60) {
    return "just now"
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`
  } else {
    return formatDate(d)
  }
}

/**
 * Alias for getRelativeTime
 */
export function formatRelativeTime(date: Date | string | number): string {
  return getRelativeTime(date)
}
