import { WebSocket } from "ws"
import { NextResponse } from "next/server"
import { addMessage, addDirectMessage } from "@/lib/redis" // Import message handling functions

export async function GET(request: Request) {
  if (request.headers.get("upgrade") !== "websocket") {
    return new NextResponse("Expected WebSocket", { status: 400 })
  }

  const socket = new WebSocket("ws://localhost:3000")

  socket.onopen = () => {
    console.log("WebSocket connected")
  }

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data)
      console.log("Received:", message)

      // Handle different message types (e.g., channel message, direct message)
      if (message.type === "channel_message") {
        const { channelId, content, senderId, senderName } = message.payload
        const messageId = await addMessage(channelId, { content, senderId, senderName })
        console.log(`Message added to channel ${channelId} with ID ${messageId}`)
      } else if (message.type === "direct_message") {
        const { dmId, content, senderId, senderName } = message.payload
        const messageId = await addDirectMessage(dmId, { content, senderId, senderName })
        console.log(`Message added to DM ${dmId} with ID ${messageId}`)
      }
    } catch (error) {
      console.error("Error processing message:", error)
    }
  }

  socket.onclose = (event) => {
    console.log("WebSocket closed:", event.code, event.reason)
  }

  socket.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  return new NextResponse(null, { status: 101, webSocket: socket })
}
