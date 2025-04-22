"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { clearStoredData } from "@/lib/storage-utils"

export function StorageDebug() {
  const [showDebug, setShowDebug] = useState(false)
  const [storageInfo, setStorageInfo] = useState<Record<string, any>>({})

  const getStorageInfo = () => {
    try {
      const info: Record<string, any> = {}

      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith("swift_")) {
          try {
            const value = localStorage.getItem(key)
            const parsedValue = value ? JSON.parse(value) : null

            // For messages and DM messages, just count the number of items
            if (key === "swift_messages" || key === "swift_dm_messages") {
              const messageCount: Record<string, number> = {}

              if (parsedValue) {
                Object.keys(parsedValue).forEach((channelId) => {
                  messageCount[channelId] = parsedValue[channelId]?.length || 0
                })
              }

              info[key] = {
                type: "message collection",
                channels: Object.keys(parsedValue || {}).length,
                messageCount,
              }
            } else {
              info[key] = {
                type: Array.isArray(parsedValue) ? "array" : "object",
                count: Array.isArray(parsedValue) ? parsedValue.length : Object.keys(parsedValue || {}).length,
                sample: Array.isArray(parsedValue)
                  ? parsedValue.slice(0, 2)
                  : Object.keys(parsedValue || {}).slice(0, 3),
              }
            }
          } catch (e) {
            info[key] = { error: "Failed to parse" }
          }
        }
      }

      setStorageInfo(info)
    } catch (error) {
      console.error("Error getting storage info:", error)
    }
  }

  const handleClearStorage = () => {
    if (confirm("Are you sure you want to clear all stored data? This cannot be undone.")) {
      clearStoredData()
      getStorageInfo()
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowDebug(true)
            getStorageInfo()
          }}
          className="bg-background/80 backdrop-blur-sm"
        >
          Storage Debug
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm">Storage Debug</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
              Close
            </Button>
          </div>
          <CardDescription className="text-xs">Persistent storage information</CardDescription>
        </CardHeader>
        <CardContent className="text-xs space-y-2 max-h-80 overflow-auto">
          {Object.keys(storageInfo).length === 0 ? (
            <p>No storage data found</p>
          ) : (
            Object.entries(storageInfo).map(([key, info]) => (
              <div key={key} className="border p-2 rounded">
                <h3 className="font-bold">{key}</h3>
                <pre className="text-xs mt-1 overflow-auto max-h-20">{JSON.stringify(info, null, 2)}</pre>
              </div>
            ))
          )}
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <Button variant="outline" size="sm" onClick={getStorageInfo}>
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearStorage}>
            Clear Storage
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
