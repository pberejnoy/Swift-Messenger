"use client"

import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { ChannelPage } from "@/src/features/messaging/channel-page"

interface ChannelPageProps {
  params: {
    channelId: string
  }
}

export default function ChannelRoute({ params }: ChannelPageProps) {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 h-screen">
        <ChannelPage channelId={params.channelId} />
      </div>
    </ProtectedRoute>
  )
}
