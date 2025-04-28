"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/src/services/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function SupabaseTest() {
  const [envStatus, setEnvStatus] = useState({
    url: false,
    key: false,
    checked: false,
  })
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    error: null as string | null,
    checked: false,
  })

  // Check environment variables
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setEnvStatus({
      url: !!url,
      key: !!key,
      checked: true,
    })
  }, [])

  // Test Supabase connection
  const testConnection = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized")
      }

      // Simple query to test connection
      const { data, error } = await supabase.from("users").select("id").limit(1)

      if (error) {
        throw error
      }

      setConnectionStatus({
        connected: true,
        error: null,
        checked: true,
      })
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        checked: true,
      })
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Checking if Supabase environment variables are accessible</CardDescription>
          </CardHeader>
          <CardContent>
            {!envStatus.checked ? (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span>Checking environment variables...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</span>
                  {envStatus.url ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-1" /> Available
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-1" /> Missing
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  {envStatus.key ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-1" /> Available
                    </span>
                  ) : (
                    <span className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-1" /> Missing
                    </span>
                  )}
                </div>

                {(!envStatus.url || !envStatus.key) && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Environment Variables</AlertTitle>
                    <AlertDescription>
                      One or more Supabase environment variables are missing. Please check your environment
                      configuration.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {(!envStatus.url || !envStatus.key) && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">How to fix:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Create a <code className="bg-muted px-1 rounded">.env.local</code> file in your project root
                  </li>
                  <li>
                    Add the following lines:
                    <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
                      NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
                      <br />
                      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                    </pre>
                  </li>
                  <li>Restart your development server</li>
                </ol>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
            <CardDescription>Test if your application can connect to Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            {!connectionStatus.checked ? (
              <Button onClick={testConnection} disabled={!envStatus.url || !envStatus.key}>
                Test Connection
              </Button>
            ) : connectionStatus.connected ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Connection Successful</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your application can successfully connect to Supabase.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Connection Failed</AlertTitle>
                  <AlertDescription>{connectionStatus.error || "Could not connect to Supabase."}</AlertDescription>
                </Alert>
                <Button onClick={testConnection} variant="outline">
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {connectionStatus.connected && (
              <div className="w-full">
                <p className="text-sm text-green-600 mb-4">
                  Your Supabase connection is working correctly! You can now proceed with building features that rely on
                  Supabase.
                </p>
                <Button asChild className="w-full">
                  <Link href="/">
                    Continue to Application <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Troubleshooting Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Environment Variables Not Accessible</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your environment variables are prefixed with{" "}
                <code className="bg-muted px-1 rounded">NEXT_PUBLIC_</code> to make them available on the client side.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Connection Errors</h3>
              <p className="text-sm text-muted-foreground">
                Check that your Supabase project is active and that the URL and anon key are correct. Also verify that
                your IP is not blocked by any security rules.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-1">Vercel Deployment</h3>
              <p className="text-sm text-muted-foreground">
                If you're deploying to Vercel, make sure to add the environment variables in your Vercel project
                settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
