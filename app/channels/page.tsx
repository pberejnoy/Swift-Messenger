import { redirect } from "next/navigation"
import { getAllChannels } from "@/lib/redis"

export default async function ChannelsIndexPage() {
  const channels = await getAllChannels()

  // Redirect to the first channel, or show a welcome page if no channels exist
  if (channels.length > 0) {
    redirect(`/channels/${channels[0].id}`)
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Welcome to the Messaging App</h1>
        <p className="mt-2 text-gray-500">Create a channel to get started</p>
      </div>
    </div>
  )
}
