"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function DiagnosticPage() {
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline" | "checking">("checking")
  const [apiStatus, setApiStatus] = useState<"ok" | "error" | "checking">("checking")
  const [redisStatus, setRedisStatus] = useState<"ok" | "error" | "checking">("checking")
  const [cookieStatus, setcookieStatus] = useState<"ok" | "error" | "checking">("checking")
  const [browserInfo, setBrowserInfo] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check network status
    setNetworkStatus(navigator.onLine ? "online" : "offline")

    // Get browser info
    const userAgent = navigator.userAgent
    const browserName = userAgent.match(/(firefox|msie|chrome|safari)[/\s](\d+)/i)?.[1] || "unknown"
    const browserVersion = userAgent.match(/(firefox|msie|chrome|safari)[/\s](\d+)/i)?.[2] || "unknown"
    setBrowserInfo(`${browserName} ${browserVersion}`)

    // Check API status
    checkApiStatus()

    // Check Redis status
    checkRedisStatus()

    // Check cookie status
    checkCookieStatus()
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

  const checkCookieStatus = () => {
    try {
      // Test if cookies are enabled
      document.cookie = "testcookie=1; SameSite=Lax"
      if (document.cookie.indexOf("testcookie=") !== -1) {
        setcookieStatus("ok")
      } else {
        setcookieStatus("error")
        setError("Cookies are disabled in your browser")
      }
    } catch (err) {
      setcookieStatus("error")
      setError("Failed to check cookie status")
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
          <CardTitle>Login Diagnostic Tool</CardTitle>
          <CardDescription>Check for common login issues</CardDescription>
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
              <span>Network Connection</span>
              <div className="flex items-center">
                <span className="mr-2">{networkStatus === "online" ? "Connected" : "Disconnected"}</span>
                {networkStatus === "online" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

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
              <span>Cookie Status</span>
              <div className="flex items-center">
                <span className="mr-2">
                  {cookieStatus === "checking" ? "Checking..." : cookieStatus === "ok" ? "Enabled" : "Disabled"}
                </span>
                {getStatusIcon(cookieStatus)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Browser</span>
              <span>{browserInfo}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
          <Button onClick={() => window.location.reload()}>Run Tests Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
