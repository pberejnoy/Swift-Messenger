"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function EnvDebug() {
  const [showEnv, setShowEnv] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Environment Variables Debug</CardTitle>
        <CardDescription>Check if your environment variables are properly set</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setShowEnv(!showEnv)}>
          {showEnv ? "Hide Environment Variables" : "Show Environment Variables"}
        </Button>

        {showEnv && (
          <div className="mt-4 space-y-2 p-4 bg-muted rounded-md">
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl ? "✅ Defined" : "❌ Not defined"}
            </p>
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseAnonKey ? "✅ Defined" : "❌ Not defined"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
