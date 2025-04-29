"use client"

import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { ChannelList } from "@/src/features/messaging/channel-list"
import { ImportDebug } from "@/src/components/debug/import-debug"

export default function ChannelsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 h-screen">
        <ChannelList />
        <div className="mt-4">
          <ImportDebug />
        </div>
      </div>
    </ProtectedRoute>
  )
}
