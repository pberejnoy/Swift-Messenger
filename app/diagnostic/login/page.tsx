"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle, Info, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function LoginDiagnosticPage() {
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline" | "checking">("checking")
  const [apiStatus, setApiStatus] = useState<"ok" | "error" | "checking">("checking")
  const [redisStatus, setRedisStatus] = useState<"ok" | "error" | "checking">("checking")
  const [cookieStatus, setCookieStatus] = useState<"ok" | "error" | "checking">("checking")
  const [browserInfo, setBrowserInfo] = useState<string>("")
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("password123")
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [newUserCredentials, setNewUserCredentials] = useState<{ email: string; password: string } | null>(null)

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

    // Load recent logs
    loadLogs()
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
        setCookieStatus("ok")
      } else {
        setCookieStatus("error")
        setError("Cookies are disabled in your browser")
      }
    } catch (err) {
      setCookieStatus("error")
      setError("Failed to check cookie status")
    }
  }

  const loadLogs = async () => {
    try {
      setIsLoadingLogs(true)
      const response = await fetch("/api/diagnostic/auth-logs")
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      } else {
        console.error("Failed to load auth logs")
      }
    } catch (err) {
      console.error("Error loading auth logs:", err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  const runLoginTest = async () => {
    setIsRunningTest(true)
    setTestResult(null)
    setTestError(null)

    try {
      // Try to login with test credentials
      const response = await fetch("/api/diagnostic/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTestResult(`Test login successful. Response: ${JSON.stringify(data)}`)
      } else {
        setTestError(data.error || "Login test failed")
      }
    } catch (err: any) {
      setTestError(err.message || "An error occurred during the test")
    } finally {
      setIsRunningTest(false)
      // Refresh logs after test
      loadLogs()
    }
  }

  const createTestUser = async () => {
    try {
      setIsRunningTest(true)
      setTestResult(null)
      setTestError(null)
      setNewUserCredentials(null)

      const response = await fetch("/api/diagnostic/create-test-user", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTestResult("New test user created successfully!")
        setNewUserCredentials({
          email: data.credentials.email,
          password: data.credentials.password,
        })

        // Auto-fill the test login form with the new credentials
        setTestEmail(data.credentials.email)
        setTestPassword(data.credentials.password)
      } else {
        setTestError(data.error || "Failed to create test user")
      }
    } catch (err: any) {
      setTestError(err.message || "An error occurred while creating test user")
    } finally {
      setIsRunningTest(false)
      // Refresh logs after creating user
      loadLogs()
    }
  }

  const fixAdminAccount = async () => {
    try {
      setIsRunningTest(true)
      const response = await fetch("/api/diagnostic/fix-admin", {
        method: "POST",
      })

      if (response.ok) {
        setTestResult("Admin account check and fix completed. Try logging in with admin credentials now.")
      } else {
        const data = await response.json()
        setTestError(data.error || "Failed to fix admin account")
      }
    } catch (err: any) {
      setTestError(err.message || "An error occurred while fixing admin account")
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
    <div className="container mx-auto py-10">
      <Card className="mb-6">
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
      </Card>

      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Login Test</TabsTrigger>
          <TabsTrigger value="logs">Auth Logs</TabsTrigger>
          <TabsTrigger value="help">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test Login</CardTitle>
              <CardDescription>Test the login functionality with sample credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <Input
                  id="test-email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-password">Test Password</Label>
                <Input
                  id="test-password"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                />
              </div>
              <Button onClick={runLoginTest} disabled={isRunningTest} className="w-full">
                {isRunningTest ? "Running Test..." : "Run Login Test"}
              </Button>

              {/* New button to create a test user */}
              <Button
                onClick={createTestUser}
                disabled={isRunningTest}
                className="w-full mt-2 bg-green-500 hover:bg-green-600"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Test User
              </Button>

              <Button
                onClick={fixAdminAccount}
                disabled={isRunningTest}
                className="w-full mt-2 bg-amber-500 hover:bg-amber-600"
              >
                Fix Admin Account
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsRunningTest(true)
                    setTestResult(null)
                    setTestError(null)

                    const response = await fetch("/api/diagnostic/reset-admin", {
                      method: "POST",
                    })

                    const data = await response.json()

                    if (response.ok) {
                      setTestResult(
                        "Admin account has been completely reset. You can now log in with the default credentials: pberejnoy@v0.com / Sl@ckV0",
                      )
                    } else {
                      setTestError(data.error || "Failed to reset admin account")
                    }
                  } catch (err: any) {
                    setTestError(err.message || "An error occurred while resetting admin account")
                  } finally {
                    setIsRunningTest(false)
                  }
                }}
                disabled={isRunningTest}
                className="w-full mt-2 bg-red-500 hover:bg-red-600"
              >
                Complete Admin Reset
              </Button>

              <Button
                onClick={async () => {
                  try {
                    setIsRunningTest(true)
                    setTestResult(null)
                    setTestError(null)

                    const response = await fetch("/api/diagnostic/clear-rate-limits", {
                      method: "POST",
                    })

                    const data = await response.json()

                    if (response.ok) {
                      setTestResult("Rate limits have been cleared. You can now attempt to log in again.")
                    } else {
                      setTestError(data.error || "Failed to clear rate limits")
                    }
                  } catch (err: any) {
                    setTestError(err.message || "An error occurred while clearing rate limits")
                  } finally {
                    setIsRunningTest(false)
                    // Refresh logs after clearing rate limits
                    loadLogs()
                  }
                }}
                disabled={isRunningTest}
                className="w-full mt-2 bg-blue-500 hover:bg-blue-600"
              >
                Clear Rate Limits
              </Button>

              <Button
                onClick={async () => {
                  try {
                    setIsRunningTest(true)
                    setTestResult(null)
                    setTestError(null)

                    const response = await fetch("/api/diagnostic/check-admin")
                    const data = await response.json()

                    if (response.ok) {
                      setTestResult(`Admin account status: ${JSON.stringify(data, null, 2)}`)
                    } else {
                      setTestError(data.error || "Failed to check admin account")
                    }
                  } catch (err: any) {
                    setTestError(err.message || "An error occurred while checking admin account")
                  } finally {
                    setIsRunningTest(false)
                  }
                }}
                disabled={isRunningTest}
                className="w-full mt-2 bg-purple-500 hover:bg-purple-600"
              >
                Check Admin Account Status
              </Button>

              {newUserCredentials && (
                <Alert className="mt-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
                  <div className="flex flex-col">
                    <h3 className="font-bold mb-2">New User Created Successfully!</h3>
                    <p>
                      <strong>Email:</strong> {newUserCredentials.email}
                    </p>
                    <p>
                      <strong>Password:</strong> {newUserCredentials.password}
                    </p>
                    <p className="mt-2 text-sm">
                      These credentials have been filled in the form above. Click "Run Login Test" to test them.
                    </p>
                  </div>
                </Alert>
              )}

              {testResult && !newUserCredentials && (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Logs</CardTitle>
              <CardDescription>Recent authentication events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex justify-center py-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                </div>
              ) : logs.length === 0 ? (
                <div className="py-4 text-center text-gray-500">No logs available</div>
              ) : (
                <div className="max-h-96 overflow-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">Time</th>
                        <th className="px-4 py-2 text-left">Event</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">{log.event}</td>
                          <td className="px-4 py-2 text-sm">{log.email || "N/A"}</td>
                          <td className="px-4 py-2 text-sm">
                            {log.event.includes("successful") ? (
                              <span className="text-green-500">Success</span>
                            ) : log.event.includes("failed") ? (
                              <span className="text-red-500">Failed</span>
                            ) : (
                              <span className="text-gray-500">Info</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button onClick={loadLogs} disabled={isLoadingLogs}>
                  Refresh Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Login Troubleshooting Guide</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="flex items-center font-medium">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  "Invalid email or password" error
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Double-check your email address and password. Remember that passwords are case-sensitive. If you've
                  forgotten your password, use the password reset feature.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center font-medium">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  "Account locked" message
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your account may be temporarily locked after multiple failed login attempts. Wait for 5 minutes and
                  try again, or contact an administrator.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center font-medium">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  Login page doesn't load or is unresponsive
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Check your internet connection and try refreshing the page. Clear your browser cache and cookies, or
                  try using a different browser.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center font-medium">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                  "Invalid email format" error
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Make sure your email address is in the correct format (e.g., name@example.com). Check for typos or
                  extra spaces.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center font-medium">
                  <Info className="mr-2 h-5 w-5 text-blue-500" />
                  Admin login information
                </h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200 font-bold mb-2">Admin Credentials:</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <strong>Email:</strong> pberejnoy@v0.com
                    <br />
                    <strong>Password:</strong> Sl@ckV0
                  </p>
                  <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    Note: Make sure to use the exact email address shown above. Common typos like "pberejnoy@gmail.com"
                    will not work.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="flex items-center font-medium">
                  <Info className="mr-2 h-5 w-5 text-blue-500" />
                  Creating a new test user
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  If you're still having trouble logging in with existing accounts, you can create a new test user with
                  the "Create New Test User" button. This will generate a new account with random credentials that you
                  can use to log in.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
        <Button onClick={() => window.location.reload()}>Run Tests Again</Button>
      </div>
    </div>
  )
}
