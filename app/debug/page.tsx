"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function DebugPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)
  const [supabaseKey, setSupabaseKey] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || null)
    setSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null)
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Environment Variables Debug</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Environment Variables</CardTitle>
          <CardDescription>Check if your Supabase environment variables are properly configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isClient && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Server Rendering</AlertTitle>
              <AlertDescription>
                This page is currently being server-rendered. Environment variable status will appear after hydration.
              </AlertDescription>
            </Alert>
          )}

          {isClient && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
                  {supabaseUrl ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Defined
                    </span>
                  ) : (
                    <span className="text-red-600">Not defined</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
                  {supabaseKey ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Defined
                    </span>
                  ) : (
                    <span className="text-red-600">Not defined</span>
                  )}
                </div>
              </div>

              <Alert variant={supabaseUrl && supabaseKey ? "default" : "destructive"}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {supabaseUrl && supabaseKey ? "Environment Variables Set" : "Environment Variables Missing"}
                </AlertTitle>
                <AlertDescription>
                  {supabaseUrl && supabaseKey
                    ? "Your Supabase environment variables are properly configured."
                    : "Please make sure to set your Supabase environment variables in your .env.local file or in your deployment platform."}
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="pt-4">
            <h3 className="font-medium mb-2">How to fix missing environment variables:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Create a <code className="bg-muted px-1 rounded">.env.local</code> file in your project root
              </li>
              <li>
                Add the following lines:
                <pre className="bg-muted p-2 rounded mt-1 text-sm overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                </pre>
              </li>
              <li>Restart your development server</li>
              <li>For production, add these environment variables in your deployment platform</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={() => (window.location.href = "/")}>Back to Home</Button>
      </div>
    </div>
  )
}
