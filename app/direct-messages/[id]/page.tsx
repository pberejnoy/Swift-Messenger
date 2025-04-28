"use client"

import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { MessagingLayout } from "@/src/features/messaging/messaging-layout"
import { DirectMessagePage } from "@/src/features/direct-messages/direct-message-page"

export default function DirectMessageRoute() {
  return (
    <ProtectedRoute>
      <MessagingLayout>
        <DirectMessagePage />
      </MessagingLayout>
    </ProtectedRoute>
  )
}
