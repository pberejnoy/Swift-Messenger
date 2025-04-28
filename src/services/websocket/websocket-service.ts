type WebSocketCallback = (data: any) => void

export class WebSocketService {
  private socket: WebSocket | null = null
  private url: string
  private callbacks: Map<string, WebSocketCallback[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null

  constructor(url: string) {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url)

        this.socket.onopen = () => {
          console.log("WebSocket connection established")
          this.reconnectAttempts = 0
          resolve()
        }

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            const eventType = data.type

            if (eventType && this.callbacks.has(eventType)) {
              const callbacks = this.callbacks.get(eventType) || []
              callbacks.forEach((callback) => callback(data))
            }
          } catch (error) {
            console.error("Error processing WebSocket message:", error)
          }
        }

        this.socket.onclose = () => {
          console.log("WebSocket connection closed")
          this.attemptReconnect()
        }

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        }
      } catch (error) {
        console.error("Error creating WebSocket:", error)
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error)
        })
      }, delay)
    } else {
      console.error("Maximum reconnection attempts reached")
    }
  }

  subscribe(eventType: string, callback: WebSocketCallback): () => void {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, [])
    }

    const callbacks = this.callbacks.get(eventType) || []
    callbacks.push(callback)
    this.callbacks.set(eventType, callbacks)

    return () => {
      const updatedCallbacks = (this.callbacks.get(eventType) || []).filter((cb) => cb !== callback)
      this.callbacks.set(eventType, updatedCallbacks)
    }
  }

  send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }
}

// Singleton instance
let websocketService: WebSocketService | null = null

export function getWebSocketService(url?: string): WebSocketService {
  if (!websocketService && url) {
    websocketService = new WebSocketService(url)
  } else if (!websocketService) {
    throw new Error("WebSocket service not initialized. Provide a URL.")
  }

  return websocketService
}

export function disconnectWebSocket(): void {
  if (websocketService) {
    websocketService.disconnect()
    websocketService = null
  }
}
