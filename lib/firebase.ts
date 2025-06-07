"use client"

let app: any = null
let auth: any = null
let db: any = null

// Only initialize if we're on the client and have the required config
if (typeof window !== "undefined") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Only initialize if we have at least the API key
  if (firebaseConfig.apiKey) {
    try {
      const { initializeApp, getApps, getApp } = require("firebase/app")
      const { getAuth } = require("firebase/auth")
      const { getFirestore } = require("firebase/firestore")

      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      auth = getAuth(app)
      db = getFirestore(app)

      console.log("Firebase initialized successfully")
    } catch (error) {
      console.log("Firebase initialization failed:", error)
      // Reset to null if initialization fails
      app = null
      auth = null
      db = null
    }
  } else {
    console.log("Firebase config not found, using local storage only")
  }
}

export { auth, db }
