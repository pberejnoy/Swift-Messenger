import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Import and re-export date utilities from the standalone file
import { formatDate, formatTime, formatDateTime, getRelativeTime, formatRelativeTime } from "@/src/lib/date-utils"

export { formatDate, formatTime, formatDateTime, getRelativeTime, formatRelativeTime }
