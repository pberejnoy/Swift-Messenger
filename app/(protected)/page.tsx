"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { useMessaging } from "@/contexts/messaging-context"
import { useAuth } from "@/contexts/auth-context"
import ChannelList from "@/components/channel-list"
import UserList from "@/components/user-list"
import MessageList from "@/components/message-list"
import MessageInput from "@/components/message-input"
import Header from "@/components/header"
import ThreadPanel from "@/components/thread-panel"
import CreateChannelDialog from "@/components/create-channel-dialog"
import LoadingScreen from "@/components/loading-screen"

export default function HomePage() {
  const { currentUser } = useAuth()
  const { activeChannel, activeThread, isLoadingMessages, state } = useMessaging()
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)

  if (!currentUser) {
    return <LoadingScreen />
  }

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      <Header onCreateChannel={() => setIsCreateChannelOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-gray-800 dark:bg-gray-900 text-white flex flex-col border-r border-gray-700">
          <div className="flex-1 overflow-auto">
            <ChannelList onCreateChannel={() => setIsCreateChannelOpen(true)} />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex overflow-hidden">
            {/* Messages */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeChannel ? (
                <>
                  <MessageList />
                  <MessageInput />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Welcome to Swift!</h2>
                    <p className="text-gray-500 mb-4">
                      {Object.keys(state.channels).length === 0
                        ? "Create your first channel to get started"
                        : "Select a channel to start messaging"}
                    </p>
                    <Button onClick={() => setIsCreateChannelOpen(true)}>Create Channel</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Thread panel */}
            {activeThread && (
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                <ThreadPanel />
              </div>
            )}

            {/* User list - only show when no thread is active */}
            {!activeThread && activeChannel && (
              <div className="w-60 border-l border-gray-200 dark:border-gray-700 overflow-auto hidden md:block">
                <UserList />
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateChannelDialog isOpen={isCreateChannelOpen} onClose={() => setIsCreateChannelOpen(false)} />
    </div>
  )
}
