/**
 * Safely checks if a path starts with a prefix
 * @param path - The path to check (can be undefined)
 * @param prefix - The prefix to check for
 * @returns boolean indicating if the path starts with the prefix
 */
export function pathStartsWith(path: string | null | undefined, prefix: string): boolean {
  if (!path) return false
  return path.startsWith(prefix)
}

/**
 * Safely checks if a path matches exactly
 * @param path - The path to check (can be undefined)
 * @param match - The path to match against
 * @returns boolean indicating if the paths match
 */
export function pathMatches(path: string | null | undefined, match: string): boolean {
  if (!path) return false
  return path === match
}

/**
 * Safely checks if a path is active (exact match or starts with prefix)
 * @param path - The path to check (can be undefined)
 * @param match - The path to match against
 * @param exact - Whether to check for exact match
 * @returns boolean indicating if the path is active
 */
export function isActivePath(path: string | null | undefined, match: string, exact = false): boolean {
  if (!path) return false
  return exact ? path === match : path.startsWith(match)
}
