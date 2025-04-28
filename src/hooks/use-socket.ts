"use client"

import { useEffect, useState } from "react"
import { getWebSocketService, disconnectWebSocket } from "@/src/services/websocket"

export function useSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const socketService = getWebSocketService(url)

    socketService
      .connect()
      .then(() => {
        setIsConnected(true)
        setError(null)
      })
      .catch((err) => {
        setIsConnected(false)
        setError(err)
      })

    return () => {
      disconnectWebSocket()
    }
  }, [url])

  const subscribe = (eventType: string, callback: (data: any) => void) => {
    try {
      const socketService = getWebSocketService()
      return socketService.subscribe(eventType, callback)
    } catch (err) {
      console.error("Error subscribing to event:", err)
      return () => {}
    }
  }

  const send = (data: any) => {
    try {
      const socketService = getWebSocketService()
      socketService.send(data)
    } catch (err) {
      console.error("Error sending data:", err)
    }
  }

  return {
    isConnected,
    error,
    subscribe,
    send,
  }
}
