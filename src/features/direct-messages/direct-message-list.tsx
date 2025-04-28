"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "@/src/services/supabase/client"
import { useAuth } from "@/src/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Circle } from "lucide-react"
import { routes } from "@/src/core/routing/routes"
import type { User } from "@/src/lib/types"

/**
 * DirectMessageList - Component for displaying a list of direct message conversations
 * Shows all users with active state for current conversation
 */
export function DirectMessageList() {
  const { user: currentUser } = useAuth()
  const params = useParams<{ id: string }>()
  const currentUserId = params?.id

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return

    async function fetchUsers() {
      if (!supabase) {
        setError("Supabase client not initialized")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .neq("id", currentUser.id) // Exclude current user
          .order("username", { ascending: true })

        if (error) {
          throw error
        }

        setUsers(data as User[])
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentUser])

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-2 text-sm text-destructive">{error}</div>
  }

  return (
    <div className="space-y-1 p-2">
      <div className="flex items-center justify-between px-2 py-1.5">
        <h3 className="text-sm font-medium">Direct Messages</h3>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <Plus className="h-4 w-4" />
          <span className="sr-only">New Message</span>
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">No users available</div>
      ) : (
        <div className="space-y-1">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className={`w-full justify-start ${user.id === currentUserId ? "bg-accent text-accent-foreground" : ""}`}
              asChild
            >
              <Link href={`${routes.directMessages}/${user.id}`}>
                <div className="relative mr-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                    <AvatarFallback className="text-[10px]">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.status === "online" && (
                    <Circle className="absolute -bottom-0.5 -right-0.5 h-2 w-2 fill-green-500 text-green-500" />
                  )}
                </div>
                {user.username}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
