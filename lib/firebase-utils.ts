/**
 * Utility functions for Firebase configuration and validation
 */

// Check if all required Firebase environment variables are present
export function checkFirebaseConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  return {
    isValid: missingVars.length === 0,
    missingVars,
  }
}

// Get Firebase config with fallback values for development
export function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  }

  // In development, provide fallback values for testing if needed
  if (process.env.NODE_ENV === "development") {
    Object.keys(config).forEach((key) => {
      if (!config[key as keyof typeof config]) {
        console.warn(`Missing Firebase config: ${key}. Using placeholder value for development.`)
      }
    })
  }

  return config
}

// Format Firebase error messages for user-friendly display
export function formatFirebaseError(errorCode: string): string {
  switch (errorCode) {
    case "auth/invalid-api-key":
      return "Invalid Firebase API key. Please contact the administrator."
    case "auth/invalid-email":
      return "Invalid email address format."
    case "auth/user-disabled":
      return "This account has been disabled."
    case "auth/user-not-found":
      return "No account found with this email address."
    case "auth/wrong-password":
      return "Incorrect password."
    case "auth/email-already-in-use":
      return "This email address is already in use."
    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password."
    case "auth/too-many-requests":
      return "Too many unsuccessful login attempts. Please try again later."
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection."
    default:
      return "An error occurred. Please try again."
  }
}
