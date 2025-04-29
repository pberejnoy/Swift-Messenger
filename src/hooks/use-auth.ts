"use client"

import { useAuth as useAuthCore } from "@/src/core/auth/auth-provider"

export function useAuth() {
  return useAuthCore()
}
