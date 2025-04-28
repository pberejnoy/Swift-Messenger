"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/src/core/auth/protected-route"
import { MessagingLayout } from "@/src/features/messaging/messaging-layout"
import { supabase } from "@/src/services/supabase/client"
import { routes } from "@/src/core/routing/routes"

export default function MessagesIndexRoute() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the first channel or show a welcome screen
    async function redirectToFirstChannel() {
      if (!supabase) return

      try {
        const { data } = await supabase.from("channels").select("id").order("created_at").limit(1).single()

        if (data) {
          router.push(`${routes.messages}/${data.id}`)
        }
      } catch (error) {
        console.error("Error fetching first channel:", error)
      }
    }

    redirectToFirstChannel()
  }, [router])

  return (
    <ProtectedRoute>
      <MessagingLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Swift Messenger</h2>
            <p className="text-muted-foreground">Select a channel to start messaging</p>
          </div>
        </div>
      </MessagingLayout>
    </ProtectedRoute>
  )
}
