"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function ChannelDiagnosticPage() {
  const [apiStatus, setApiStatus] = useState<"ok" | "error" | "checking">("checking")
  const [redisStatus, setRedisStatus] = useState<"ok" | "error" | "checking">("checking")
  const [permissionStatus, setPermissionStatus] = useState<"ok" | "error" | "checking">("checking")
  const [testChannelName, setTestChannelName] = useState("test-channel")
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkApiStatus()
    checkRedisStatus()
    checkPermissionStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/diagnostic/ping")
      if (response.ok) {
        setApiStatus("ok")
      } else {
        setApiStatus("error")
        setError("API endpoint is not responding correctly")
      }
    } catch (err) {
      setApiStatus("error")
      setError("Failed to connect to API endpoint")
    }
  }

  const checkRedisStatus = async () => {
    try {
      const response = await fetch("/api/diagnostic/redis")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRedisStatus("ok")
        } else {
          setRedisStatus("error")
          setError(data.error || "Redis connection failed")
        }
      } else {
        setRedisStatus("error")
        setError("Redis check endpoint is not responding correctly")
      }
    } catch (err) {
      setRedisStatus("error")
      setError("Failed to check Redis connection")
    }
  }

  const checkPermissionStatus = async () => {
    try {
      const response = await fetch("/api/diagnostic/permissions")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPermissionStatus("ok")
        } else {
          setPermissionStatus("error")
          setError(data.error || "Permission check failed")
        }
      } else {
        setPermissionStatus("error")
        setError("Permission check endpoint is not responding correctly")
      }
    } catch (err) {
      setPermissionStatus("error")
      setError("Failed to check permissions")
    }
  }

  const runChannelTest = async () => {
    setIsRunningTest(true)
    setTestResult(null)
    setTestError(null)

    try {
      // Try to create a test channel
      const response = await fetch("/api/diagnostic/test-channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: testChannelName }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTestResult(`Test channel "${testChannelName}" created successfully. Channel ID: ${data.channelId}`)
      } else {
        setTestError(data.error || "Failed to create test channel")
      }
    } catch (err: any) {
      setTestError(err.message || "An error occurred during the test")
    } finally {
      setIsRunningTest(false)
    }
  }

  const getStatusIcon = (status: "ok" | "error" | "checking") => {
    if (status === "checking")
      return <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
    if (status === "ok") return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Channel Creation Diagnostic</CardTitle>
          <CardDescription>Check for issues with channel creation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>API Status</span>
              <div className="flex items-center">
                <span className="mr-2">
                  {apiStatus === "checking" ? "Checking..." : apiStatus === "ok" ? "OK" : "Error"}
                </span>
                {getStatusIcon(apiStatus)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Database Connection</span>
              <div className="flex items-center">
                <span className="mr-2">
                  {redisStatus === "checking" ? "Checking..." : redisStatus === "ok" ? "OK" : "Error"}
                </span>
                {getStatusIcon(redisStatus)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>User Permissions</span>
              <div className="flex items-center">
                <span className="mr-2">
                  {permissionStatus === "checking" ? "Checking..." : permissionStatus === "ok" ? "OK" : "Error"}
                </span>
                {getStatusIcon(permissionStatus)}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-2 font-medium">Test Channel Creation</h3>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="test-channel">Test Channel Name</Label>
                  <Input
                    id="test-channel"
                    value={testChannelName}
                    onChange={(e) => setTestChannelName(e.target.value)}
                    placeholder="test-channel"
                  />
                </div>
                <Button onClick={runChannelTest} disabled={isRunningTest} className="w-full">
                  {isRunningTest ? "Running Test..." : "Run Test"}
                </Button>

                {testResult && (
                  <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{testResult}</AlertDescription>
                  </Alert>
                )}

                {testError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{testError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/channels">Back to Channels</Link>
          </Button>
          <Button onClick={() => window.location.reload()}>Run Tests Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
