import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, type Auth } from "firebase/auth"
import { getStorage } from "firebase/storage"

// Create a mock implementation for development/testing when Firebase is not configured
const createMockServices = () => {
  console.warn("Using mock Firebase services - authentication will not work properly")

  // Mock auth service with required methods that match Firebase Auth API
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null)
      return () => {}
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
      throw new Error("Firebase is not configured. Using mock auth service.")
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      throw new Error("Firebase is not configured. Using mock auth service.")
    },
    signOut: async () => {},
  } as unknown as Auth // Cast to Auth type to ensure compatibility

  // Mock firestore
  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: false,
          data: () => ({}),
        }),
        set: async () => {},
        update: async () => {},
      }),
      where: () => ({
        get: async () => ({
          docs: [],
        }),
      }),
    }),
  }

  // Mock storage
  const mockStorage = {}

  return { mockAuth, mockDb, mockStorage }
}

// Initialize Firebase with proper error handling
let app: FirebaseApp | undefined
let db: any
let auth: Auth
let storage: any
let firebaseInitialized = false
let firebasePermissionsError = false

try {
  // Check if required environment variables are present
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (!apiKey || !authDomain || !projectId) {
    console.warn("Missing required Firebase configuration. Using local storage instead.")
    console.warn(
      "Required environment variables: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    )

    // Use mock services instead
    const { mockAuth, mockDb, mockStorage } = createMockServices()
    auth = mockAuth
    db = mockDb
    storage = mockStorage
  } else {
    // Firebase configuration
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    // Initialize Firebase if not already initialized
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    // Initialize services
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    firebaseInitialized = true

    console.log("Firebase initialized successfully")

    // Test permissions - this will be done asynchronously
    // We don't await this because we don't want to block initialization
    const testPermissions = async () => {
      try {
        const { collection, getDocs, query, limit } = await import("firebase/firestore")
        const testRef = collection(db, "users")
        await getDocs(query(testRef, limit(1)))
      } catch (error: any) {
        if (error.code === "permission-denied") {
          console.warn("Firebase permissions issue detected. Will use local storage as fallback.")
          firebasePermissionsError = true
        }
      }
    }

    testPermissions()
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  console.warn("Falling back to local storage for data persistence")

  // Use mock services on initialization error
  const { mockAuth, mockDb, mockStorage } = createMockServices()
  auth = mockAuth
  db = mockDb
  storage = mockStorage
}

export { db, auth, storage, firebaseInitialized, firebasePermissionsError }
export default app
