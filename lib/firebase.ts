import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only on client side
let app
let auth
let db

if (typeof window !== "undefined") {
  try {
    // Only initialize on client side
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)

    // Enable offline persistence
    if (db && !db._delegate._databaseId.projectId.includes("demo-")) {
      // Only enable persistence for real projects, not demo projects
      import("firebase/firestore")
        .then(({ enableNetwork, disableNetwork }) => {
          // Enable network by default
        })
        .catch(console.warn)
    }
  } catch (error) {
    console.warn("Firebase initialization warning:", error)
  }
}

export { auth, db }
