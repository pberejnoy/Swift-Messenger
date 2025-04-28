"use client"

import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { MessagingLayout } from "@/src/features/messaging/messaging-layout"

export default function DirectMessagesIndexRoute() {
  return (
    <ProtectedRoute>
      <MessagingLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Direct Messages</h2>
            <p className="text-muted-foreground">Select a user to start a conversation</p>
          </div>
        </div>
      </MessagingLayout>
    </ProtectedRoute>
  )
}
