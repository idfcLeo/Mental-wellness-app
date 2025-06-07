"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import LoadingSpinner from "@/components/loading-spinner"
import { storage } from "@/lib/storage"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set a timeout to ensure loading doesn't get stuck
        const timeoutId = setTimeout(() => {
          setLoading(false)
        }, 3000) // 3 second timeout

        // Check local storage first (faster)
        const localUser = storage.getCurrentUser()
        if (localUser) {
          clearTimeout(timeoutId)
          router.push("/dashboard")
          return
        }

        // Only try Firebase if we're on the client and have config
        if (typeof window !== "undefined") {
          try {
            const { onAuthStateChanged } = await import("firebase/auth")
            const { auth } = await import("@/lib/firebase")

            if (auth) {
              const unsubscribe = onAuthStateChanged(auth, (user) => {
                clearTimeout(timeoutId)
                if (user) {
                  // Save to local storage for faster future loads
                  storage.setCurrentUser({
                    id: user.uid,
                    email: user.email || "",
                    name: user.displayName || "User",
                  })
                  router.push("/dashboard")
                } else {
                  setLoading(false)
                }
              })

              // Cleanup function
              return () => {
                clearTimeout(timeoutId)
                unsubscribe()
              }
            } else {
              // Firebase not available, proceed to login
              clearTimeout(timeoutId)
              setLoading(false)
            }
          } catch (firebaseError) {
            console.log("Firebase auth check failed:", firebaseError)
            clearTimeout(timeoutId)
            setLoading(false)
          }
        } else {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setLoading(false)
      }
    }

    initAuth()
  }, [router])

  if (loading) {
    return <LoadingSpinner />
  }

  return <LoginForm />
}
