"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactSupportPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [issueType, setIssueType] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [browserInfo, setBrowserInfo] = useState("")

  // Get browser info on component mount
  useState(() => {
    const userAgent = navigator.userAgent
    const browserName = userAgent.match(/(firefox|msie|chrome|safari|edge)[/\s](\d+)/i)?.[1] || "unknown"
    const browserVersion = userAgent.match(/(firefox|msie|chrome|safari|edge)[/\s](\d+)/i)?.[2] || "unknown"
    setBrowserInfo(`${browserName} ${browserVersion} (${navigator.platform})`)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    // Validate form
    if (!name || !email || !issueType || !message) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    try {
      // In a real app, this would send the support request to a backend
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      setName("")
      setEmail("")
      setIssueType("")
      setMessage("")
    } catch (err: any) {
      setError(err.message || "Failed to submit support request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Having trouble with the application? Let us know and we'll help you resolve the issue.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your support request has been submitted successfully. We'll get back to you as soon as possible.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue Type</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger id="issue-type">
                  <SelectValue placeholder="Select an issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="login">Login Problems</SelectItem>
                  <SelectItem value="channels">Channel Issues</SelectItem>
                  <SelectItem value="messages">Messaging Problems</SelectItem>
                  <SelectItem value="account">Account Settings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>System Information</Label>
              <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p>Browser: {browserInfo}</p>
                <p>
                  Screen: {typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "Unknown"}
                </p>
                <p>Time: {new Date().toLocaleString()}</p>
              </div>
              <p className="text-xs text-gray-500">
                This information will be included with your support request to help us diagnose the issue.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
            <Button type="submit" disabled={loading || success}>
              {loading ? "Submitting..." : success ? "Submitted" : "Submit Request"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
