"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default function BrowserTestPage() {
  const [browserInfo, setBrowserInfo] = useState<string>("")
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean>(false)
  const [localStorageAvailable, setLocalStorageAvailable] = useState<boolean>(false)
  const [sessionStorageAvailable, setSessionStorageAvailable] = useState<boolean>(false)
  const [fetchAvailable, setFetchAvailable] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get browser info
    const userAgent = navigator.userAgent
    const browserName = userAgent.match(/(firefox|msie|chrome|safari|edge)[/\s](\d+)/i)?.[1] || "unknown"
    const browserVersion = userAgent.match(/(firefox|msie|chrome|safari|edge)[/\s](\d+)/i)?.[2] || "unknown"
    setBrowserInfo(`${browserName} ${browserVersion} (${navigator.platform})`)

    // Check cookies
    try {
      document.cookie = "testcookie=1; SameSite=Lax"
      setCookiesEnabled(document.cookie.indexOf("testcookie=") !== -1)
    } catch (err) {
      setCookiesEnabled(false)
    }

    // Check localStorage
    try {
      localStorage.setItem("test", "test")
      const testValue = localStorage.getItem("test")
      setLocalStorageAvailable(testValue === "test")
      localStorage.removeItem("test")
    } catch (err) {
      setLocalStorageAvailable(false)
    }

    // Check sessionStorage
    try {
      sessionStorage.setItem("test", "test")
      const testValue = sessionStorage.getItem("test")
      setSessionStorageAvailable(testValue === "test")
      sessionStorage.removeItem("test")
    } catch (err) {
      setSessionStorageAvailable(false)
    }

    // Check fetch API
    setFetchAvailable(typeof fetch !== "undefined")
  }, [])

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Browser Compatibility Test</CardTitle>
          <CardDescription>Check if your browser is compatible with the application</CardDescription>
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
              <span>Browser</span>
              <span>{browserInfo}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Cookies Enabled</span>
              <div className="flex items-center">
                {cookiesEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Local Storage</span>
              <div className="flex items-center">
                {localStorageAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Session Storage</span>
              <div className="flex items-center">
                {sessionStorageAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Fetch API</span>
              <div className="flex items-center">
                {fetchAvailable ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h3 className="font-medium mb-2">Compatibility Results</h3>
            {cookiesEnabled && localStorageAvailable && sessionStorageAvailable && fetchAvailable ? (
              <p className="text-green-600 dark:text-green-400">
                Your browser is fully compatible with the application.
              </p>
            ) : (
              <p className="text-red-600 dark:text-red-400">
                Your browser may not be fully compatible with the application. Please enable cookies and JavaScript, or
                try a different browser.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" asChild>
            <Link href="/login">Back to Login</Link>
          </Button>
          <Button onClick={() => window.location.reload()}>Run Test Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
