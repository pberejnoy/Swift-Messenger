"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { firebaseInitialized, firebasePermissionsError } from "@/lib/firebase"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { isLocalStorageAvailable } from "@/lib/storage-utils"

export default function FirebaseConfigChecker() {
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [permissionsError, setPermissionsError] = useState(false)
  const [localStorageAvailable, setLocalStorageAvailable] = useState(true)

  useEffect(() => {
    // Check if localStorage is available
    setLocalStorageAvailable(isLocalStorageAvailable())

    // Check if Firebase environment variables are set
    const requiredEnvVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    ]

    const missing = requiredEnvVars.filter((varName) => !process.env[varName])
    setMissingVars(missing)

    // Check for permissions issues if Firebase is initialized
    if (firebaseInitialized && missing.length === 0) {
      // Set permissions error from the global flag
      setPermissionsError(firebasePermissionsError)

      // Also do a live check
      const testPermissions = async () => {
        try {
          // Try to access a test collection
          const testRef = collection(db, "users")
          await getDocs(query(testRef, limit(1)))
        } catch (error: any) {
          if (error.code === "permission-denied") {
            setPermissionsError(true)
          }
        }
      }
      testPermissions()
    }
  }, [])

  if (!localStorageAvailable) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Local Storage Not Available</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Local storage is not available in your browser. This application requires local storage to function
            properly.
          </p>
          <p className="text-sm">Please enable local storage in your browser settings or try a different browser.</p>
        </AlertDescription>
      </Alert>
    )
  }

  if (!firebaseInitialized || missingVars.length > 0) {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Using Local Storage Mode</AlertTitle>
        <AlertDescription>
          {missingVars.length > 0 ? (
            <>
              <p className="mb-2">
                Firebase is not properly configured. The application will use local storage instead.
              </p>
              {missingVars.length > 0 && (
                <div className="text-sm">
                  <p>Missing environment variables:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {missingVars.map((varName) => (
                      <li key={varName}>{varName}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="mb-2">Firebase is not initialized. The application will use local storage instead.</p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (permissionsError) {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
        <Info className="h-4 w-4" />
        <AlertTitle>Firebase Permissions Issue</AlertTitle>
        <AlertDescription>
          <p className="mb-2">
            Firebase permissions issue detected. The application will use local storage as a fallback.
          </p>
          <p className="text-sm">
            This is a common issue when Firebase security rules are not properly configured. All data will be stored
            locally in your browser.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
