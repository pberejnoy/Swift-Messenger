"use client"

import { useEffect, useState, useRef, useCallback } from "react"

type WebSocketMessage = {
  type: string
  payload: any
}

// Feature flag to disable WebSockets entirely
const DISABLE_WEBSOCKETS = true // Set to true to force polling in all environments

export function useWebSocket(userId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const socketRef = useRef<WebSocket | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 3
  const [isPolling, setIsPolling] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)
  const userIdRef = useRef<string>(userId)

  // Update userIdRef when userId changes
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  // Check if WebSockets are supported in this environment
  const isWebSocketSupported = useCallback(() => {
    return typeof WebSocket !== "undefined" && !DISABLE_WEBSOCKETS
  }, [])

  // Set up polling for messages
  const setupPolling = useCallback((channelId?: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    if (!userIdRef.current) return

    console.log("Setting up polling for messages")
    setIsPolling(true)

    // Determine the endpoint based on whether we have a channelId
    const getEndpoint = () => {
      if (channelId) {
        return `/api/channels/${channelId}/messages`
      }
      // If no channelId, poll for all messages for this user
      return `/api/messages`
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Skip polling if userId is not available
        if (!userIdRef.current) return

        const endpoint = getEndpoint()
        const response = await fetch(endpoint)
        if (response.ok) {
          const data = await response.json()

          // Process new messages
          if (data.messages && data.messages.length > 0) {
            // Find the newest message that we haven't seen yet
            const newMessages = data.messages.filter((msg: any) => {
              // If we don't have a lastMessageId, all messages are new
              if (!lastMessageIdRef.current) return true

              // Otherwise, only include messages we haven't seen
              return msg.id > lastMessageIdRef.current
            })

            if (newMessages.length > 0) {
              // Update the last message ID
              const newestMessage = newMessages[newMessages.length - 1]
              lastMessageIdRef.current = newestMessage.id

              // Format messages as WebSocket messages for consistency
              const formattedMessages = newMessages.map((msg: any) => ({
                type: channelId ? "channel_message" : "direct_message",
                payload: {
                  id: msg.id,
                  content: msg.content,
                  senderId: msg.sender.id,
                  senderName: msg.sender.name,
                  channelId: channelId,
                  timestamp: msg.timestamp,
                },
              }))

              // Add new messages to the state
              setMessages((prev) => [...prev, ...formattedMessages])
            }
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error)
      }
    }, 3000) // Poll every 3 seconds
  }, [])

  const connect = useCallback(() => {
    // Don't attempt to connect if we don't have a userId
    if (!userIdRef.current) {
      console.log("WebSocket connection skipped: No user ID provided")
      return () => {}
    }

    // Check if WebSockets are supported
    if (!isWebSocketSupported()) {
      console.log("WebSockets are not supported in this environment, using polling instead")
      setConnectionError("Real-time updates are not available in this environment. Using polling instead.")
      return () => {}
    }

    try {
      // Use secure WebSocket in production
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
      const wsUrl = `${protocol}//${window.location.host}/api/ws?userId=${userIdRef.current}`

      console.log(`Attempting WebSocket connection to ${wsUrl}`)

      // Create a new WebSocket connection
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttemptsRef.current = 0
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage
          setMessages((prev) => [...prev, message])
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      socket.onclose = (event) => {
        console.log(`WebSocket disconnected with code: ${event.code}, reason: ${event.reason}`)
        setIsConnected(false)

        // Attempt to reconnect after a delay, with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000)
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`,
          )

          setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.CLOSED) {
              reconnectAttemptsRef.current++
              connect()
            }
          }, delay)
        } else {
          setConnectionError(
            "Failed to establish WebSocket connection after multiple attempts. Using polling for updates.",
          )
          console.log("Maximum reconnection attempts reached. Falling back to polling.")

          // Get the current channel ID from the URL
          const pathParts = window.location.pathname.split("/")
          const channelId = pathParts[2] === "channels" ? pathParts[3] : undefined

          // Set up polling as fallback
          setupPolling(channelId)
        }
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionError("WebSocket connection error. Using polling for updates.")

        // Close the socket on error to trigger the onclose handler
        socket.close()
      }

      socketRef.current = socket

      return () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close()
        }
      }
    } catch (error) {
      console.error("Error setting up WebSocket:", error)
      setConnectionError("Failed to set up WebSocket connection. Using polling for updates.")

      // Get the current channel ID from the URL
      const pathParts = window.location.pathname.split("/")
      const channelId = pathParts[2] === "channels" ? pathParts[3] : undefined

      // Set up polling as fallback
      setupPolling(channelId)

      return () => {}
    }
  }, [isWebSocketSupported, setupPolling])

  useEffect(() => {
    // If WebSockets are not supported, set up polling immediately
    if (!isWebSocketSupported()) {
      // Get the current channel ID from the URL
      const pathParts = window.location.pathname.split("/")
      const channelId = pathParts[2] === "channels" ? pathParts[3] : undefined

      setupPolling(channelId)
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }

    // Otherwise, try to connect via WebSocket
    const cleanup = connect()

    return () => {
      cleanup()
      if (socketRef.current) {
        socketRef.current.close()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [connect, isWebSocketSupported, setupPolling])

  // Reconnect WebSocket or restart polling when userId changes
  useEffect(() => {
    if (userId) {
      // Clean up existing connections
      if (socketRef.current) {
        socketRef.current.close()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }

      // Reset state
      setIsConnected(false)
      setConnectionError(null)
      reconnectAttemptsRef.current = 0
      setIsPolling(false)

      // Reconnect with new userId
      if (isWebSocketSupported()) {
        connect()
      } else {
        const pathParts = window.location.pathname.split("/")
        const channelId = pathParts[2] === "channels" ? pathParts[3] : undefined
        setupPolling(channelId)
      }
    }
  }, [userId, connect, isWebSocketSupported, setupPolling])

  const sendMessage = useCallback((type: string, payload: any) => {
    // If WebSocket is connected, send through WebSocket
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }))
      return true
    }

    // Otherwise, message will be sent via API and picked up by polling
    return false
  }, [])

  return {
    isConnected,
    messages,
    sendMessage,
    connectionError,
    isPolling,
  }
}
