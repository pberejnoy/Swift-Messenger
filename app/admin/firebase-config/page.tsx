"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Copy, Eye, EyeOff } from "lucide-react"
import { checkFirebaseConfig } from "@/lib/firebase-utils"
import { useToast } from "@/hooks/use-toast"

export default function FirebaseConfigPage() {
  const [configStatus, setConfigStatus] = useState<"checking" | "valid" | "invalid">("checking")
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [showValues, setShowValues] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const { isValid, missingVars } = checkFirebaseConfig()
    setConfigStatus(isValid ? "valid" : "invalid")
    setMissingVars(missingVars)
  }, [])

  const copyToClipboard = (varName: string) => {
    const value = process.env[varName] || ""
    navigator.clipboard.writeText(value)
    setCopied(varName)

    toast({
      title: "Copied to clipboard",
      description: `${varName} has been copied to your clipboard.`,
    })

    setTimeout(() => setCopied(null), 2000)
  }

  const firebaseVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Firebase Configuration</h1>

      {configStatus === "invalid" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Your Firebase configuration is incomplete. This will cause authentication and data storage issues.
            </p>
            <p className="font-semibold">Missing environment variables:</p>
            <ul className="list-disc pl-5 mt-1">
              {missingVars.map((varName) => (
                <li key={varName}>{varName}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {configStatus === "valid" && (
        <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Firebase Configuration Valid</AlertTitle>
          <AlertDescription>All required Firebase environment variables are present.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Firebase Environment Variables</CardTitle>
          <CardDescription>
            These environment variables are used to configure Firebase in your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValues(!showValues)}
              className="flex items-center gap-2"
            >
              {showValues ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Values
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Values
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {firebaseVars.map((varName) => {
              const value = process.env[varName] || ""
              const isMissing = !value

              return (
                <div key={varName} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{varName}</span>
                    {!isMissing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(varName)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className={`h-4 w-4 ${copied === varName ? "text-green-500" : ""}`} />
                        <span className="sr-only">Copy</span>
                      </Button>
                    )}
                  </div>
                  <div
                    className={`p-2 rounded-md text-sm font-mono ${isMissing ? "bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-300" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    {isMissing ? <span>Not set</span> : showValues ? value : "••••••••••••••••••••••••••••••"}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <h3 className="font-medium mb-2">How to set environment variables</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Add these variables to your{" "}
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">.env.local</code> file:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
              {firebaseVars
                .map((varName) => `${varName}=your_${varName.toLowerCase().replace("next_public_firebase_", "")}_here`)
                .join("\n")}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
