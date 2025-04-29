"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ImportDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkImports = async () => {
    try {
      setError(null)

      // Try to dynamically import the messaging service
      const messagingService = await import("@/src/services/messaging-service/messaging-service")

      setDebugInfo({
        messagingServiceFunctions: Object.keys(messagingService),
        importSuccess: true,
      })
    } catch (err) {
      console.error("Import error:", err)
      setError(err instanceof Error ? err.message : "Unknown error during import")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Import Debug</CardTitle>
        <CardDescription>Check if imports are working correctly</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            <p className="font-medium">Import Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {debugInfo && (
          <div className="space-y-2">
            <div>
              <strong>Import Success:</strong> {debugInfo.importSuccess ? "Yes" : "No"}
            </div>
            <div>
              <strong>Available Functions:</strong>
              <ul className="list-disc pl-5 mt-1">
                {debugInfo.messagingServiceFunctions.map((fn: string) => (
                  <li key={fn} className="text-sm">
                    {fn}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkImports}>Check Imports</Button>
      </CardFooter>
    </Card>
  )
}
