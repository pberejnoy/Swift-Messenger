"use client"

import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { MessagingLayout } from "@/src/features/messaging/messaging-layout"
import { ChannelPage } from "@/src/features/messaging/channel-page"

export default function ChannelRoute() {
  return (
    <ProtectedRoute>
      <MessagingLayout>
        <ChannelPage />
      </MessagingLayout>
    </ProtectedRoute>
  )
}
