"use client"

// Firebase state management
let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null
let isInitialized = false
let isInitializing = false
let initPromise: Promise<boolean> | null = null

// Firebase configuration
const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Log config status for debugging (without exposing sensitive data)
  console.log("Firebase config status:", {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    hasStorageBucket: !!config.storageBucket,
    hasMessagingSenderId: !!config.messagingSenderId,
    hasAppId: !!config.appId,
  })

  return config
}

// Check if Firebase config is complete
const hasValidFirebaseConfig = () => {
  const config = getFirebaseConfig()
  const required = ["apiKey", "authDomain", "projectId", "appId"]

  const missingKeys = required.filter((key) => !config[key as keyof typeof config])

  if (missingKeys.length > 0) {
    console.log(`Firebase: Missing required config keys: ${missingKeys.join(", ")}`)
    return false
  }

  console.log("Firebase: Configuration is valid")
  return true
}

// Initialize Firebase with comprehensive error handling
const initializeFirebase = async (): Promise<boolean> => {
  // Skip if not in browser
  if (typeof window === "undefined") {
    console.log("Firebase: Not in browser environment")
    return false
  }

  // Skip if no valid config
  if (!hasValidFirebaseConfig()) {
    console.log("Firebase: Invalid or incomplete configuration, using local storage only")
    return false
  }

  // Skip if already initialized
  if (isInitialized) {
    console.log("Firebase: Already initialized")
    return true
  }

  // Skip if already initializing
  if (isInitializing) {
    console.log("Firebase: Already initializing")
    return initPromise || Promise.resolve(false)
  }

  isInitializing = true
  console.log("Firebase: Starting initialization...")

  try {
    // Log Firebase config for debugging (without exposing sensitive data)
    const config = getFirebaseConfig()
    console.log("Firebase config status:", {
      hasApiKey: !!config.apiKey,
      hasAuthDomain: !!config.authDomain,
      hasProjectId: !!config.projectId,
      hasStorageBucket: !!config.storageBucket,
      hasMessagingSenderId: !!config.messagingSenderId,
      hasAppId: !!config.appId,
    })

    // Import Firebase modules with individual error handling
    let firebaseApp_module, firebaseAuth_module, firebaseFirestore_module

    try {
      firebaseApp_module = await import("firebase/app")
      console.log("Firebase: App module loaded")
    } catch (error) {
      console.error("Firebase: Failed to load app module:", error)
      throw new Error("Failed to load Firebase app module")
    }

    try {
      firebaseAuth_module = await import("firebase/auth")
      console.log("Firebase: Auth module loaded")
    } catch (error) {
      console.error("Firebase: Failed to load auth module:", error)
      firebaseAuth_module = null
    }

    try {
      firebaseFirestore_module = await import("firebase/firestore")
      console.log("Firebase: Firestore module loaded")
    } catch (error) {
      console.error("Firebase: Failed to load firestore module:", error)
      firebaseFirestore_module = null
    }

    // Initialize Firebase App
    try {
      // Check if Firebase is already initialized
      const apps = firebaseApp_module.getApps()
      console.log("Firebase: Existing apps count:", apps.length)

      if (apps.length === 0) {
        console.log("Firebase: Initializing new app with config")
        firebaseApp = firebaseApp_module.initializeApp(config)
        console.log("Firebase: New app initialized successfully")
      } else {
        console.log("Firebase: Using existing app")
        firebaseApp = firebaseApp_module.getApp()
      }
    } catch (appError) {
      console.error("Firebase: App initialization failed:", appError)
      throw new Error("Failed to initialize Firebase app")
    }

    // Wait for app to be ready
    await new Promise((resolve) => setTimeout(resolve, 500))

    let servicesInitialized = 0

    // Initialize Auth (optional)
    if (firebaseAuth_module && firebaseApp) {
      try {
        console.log("Firebase: Initializing Auth service")
        firebaseAuth = firebaseAuth_module.getAuth(firebaseApp)
        console.log("Firebase: Auth service initialized")

        // Set persistence with error handling
        try {
          console.log("Firebase: Setting auth persistence")
          await firebaseAuth_module.setPersistence(firebaseAuth, firebaseAuth_module.browserLocalPersistence)
          console.log("Firebase: Auth persistence set successfully")
          servicesInitialized++
        } catch (persistenceError) {
          console.warn("Firebase: Auth persistence failed, but auth still available:", persistenceError)
          servicesInitialized++
        }
      } catch (authError) {
        console.warn("Firebase: Auth initialization failed:", authError)
        firebaseAuth = null
      }
    }

    // Initialize Firestore (optional)
    if (firebaseFirestore_module && firebaseApp) {
      try {
        console.log("Firebase: Initializing Firestore service")
        firebaseDb = firebaseFirestore_module.getFirestore(firebaseApp)
        console.log("Firebase: Firestore service initialized")
        servicesInitialized++
      } catch (dbError) {
        console.warn("Firebase: Firestore initialization failed:", dbError)
        firebaseDb = null
      }
    }

    // Consider initialization successful if we have the app, even without services
    if (firebaseApp) {
      isInitialized = true
      console.log(`Firebase: Initialization completed (${servicesInitialized} services available)`)
      return true
    } else {
      throw new Error("Firebase app could not be initialized")
    }
  } catch (error) {
    console.error("Firebase: Complete initialization failed:", error)

    // Reset state on failure
    firebaseApp = null
    firebaseAuth = null
    firebaseDb = null
    isInitialized = false

    return false
  } finally {
    isInitializing = false
  }
}

// Get Firebase Auth with safe initialization
export const getFirebaseAuth = async (): Promise<any> => {
  try {
    // Return immediately if already initialized and available
    if (isInitialized && firebaseAuth) {
      console.log("Firebase Auth: Already initialized and available")
      return firebaseAuth
    }

    // Don't try to initialize if no valid config
    if (!hasValidFirebaseConfig()) {
      console.log("Firebase Auth: No valid config available")
      return null
    }

    // Initialize if not already doing so
    if (!initPromise) {
      console.log("Firebase Auth: Starting initialization")
      initPromise = initializeFirebase()
    } else {
      console.log("Firebase Auth: Initialization already in progress")
    }

    const success = await initPromise
    console.log("Firebase Auth: Initialization result:", success)

    if (success && firebaseAuth) {
      console.log("Firebase Auth: Available and ready")
      return firebaseAuth
    } else {
      console.log("Firebase Auth: Not available after initialization attempt")
      return null
    }
  } catch (error) {
    console.error("Firebase Auth: Error during initialization:", error)
    return null
  }
}

// Get Firestore with safe initialization
export const getFirebaseDb = async (): Promise<any> => {
  try {
    // Return immediately if already initialized and available
    if (isInitialized && firebaseDb) {
      return firebaseDb
    }

    // Don't try to initialize if no valid config
    if (!hasValidFirebaseConfig()) {
      console.log("Firebase Firestore: No valid config available")
      return null
    }

    // Initialize if not already doing so
    if (!initPromise) {
      initPromise = initializeFirebase()
    }

    const success = await initPromise

    if (success && firebaseDb) {
      console.log("Firebase Firestore: Available and ready")
      return firebaseDb
    } else {
      console.log("Firebase Firestore: Not available, using local storage")
      return null
    }
  } catch (error) {
    console.error("Firebase Firestore: Error during initialization:", error)
    return null
  }
}

// Check if Firebase is available and initialized
export const isFirebaseAvailable = (): boolean => {
  return isInitialized && hasValidFirebaseConfig()
}

// Get current initialization status
export const getFirebaseStatus = () => ({
  isInitialized,
  isInitializing,
  hasValidConfig: hasValidFirebaseConfig(),
  hasAuth: firebaseAuth !== null,
  hasDb: firebaseDb !== null,
  configStatus: hasValidFirebaseConfig() ? "valid" : "invalid/missing",
})

// Reset Firebase state (useful for testing)
export const resetFirebase = () => {
  firebaseApp = null
  firebaseAuth = null
  firebaseDb = null
  isInitialized = false
  isInitializing = false
  initPromise = null
  console.log("Firebase: State reset")
}

// Legacy exports (will be null until initialized)
export const auth = firebaseAuth
export const db = firebaseDb
