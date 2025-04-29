"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/src/services/supabase/client"

type SocketEvent = "INSERT" | "UPDATE" | "DELETE"

interface SocketOptions {
  event?: SocketEvent
  schema?: string
  table: string
  filter?: string
}

export function useSocket<T = any>(options: SocketOptions) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const { event = "*", schema = "public", table, filter } = options

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        "postgres_changes",
        {
          event,
          schema,
          table,
          filter,
        },
        (payload) => {
          setData(payload.new as T)
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [options])

  return { data, error, isConnected }
}
