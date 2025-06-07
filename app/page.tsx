"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import LoadingSpinner from "@/components/loading-spinner"
import { storage } from "@/lib/storage"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    let authUnsubscribe: (() => void) | null = null

    const checkAuth = async () => {
      try {
        console.log("HomePage: Starting auth check")

        // Check local storage first for immediate response
        const localUser = storage.getCurrentUser()
        if (localUser && mounted) {
          console.log("HomePage: Found local user, redirecting to dashboard")
          setIsAuthenticated(true)
          router.push("/dashboard")
          return
        }

        console.log("HomePage: No local user found, checking Firebase...")

        // Set a reasonable timeout for Firebase check
        const firebaseTimeout = setTimeout(() => {
          if (mounted && loading) {
            console.log("HomePage: Firebase check timeout, showing login")
            setIsAuthenticated(false)
            setLoading(false)
          }
        }, 3000)

        // Try Firebase auth (completely non-blocking)
        try {
          const { getFirebaseAuth, getFirebaseStatus } = await import("@/lib/firebase")

          // Log Firebase status for debugging
          const status = getFirebaseStatus()
          console.log("HomePage: Firebase status:", status)

          if (!status.hasValidConfig) {
            console.log("HomePage: Firebase config is invalid, showing login form")
            clearTimeout(firebaseTimeout)
            if (mounted) {
              setIsAuthenticated(false)
              setLoading(false)
            }
            return
          }

          const auth = await getFirebaseAuth()

          if (auth && mounted) {
            console.log("HomePage: Firebase auth available, setting up listener")
            const { onAuthStateChanged } = await import("firebase/auth")

            // Log current auth state
            console.log("HomePage: Current auth state:", auth.currentUser ? "logged in" : "logged out")

            authUnsubscribe = onAuthStateChanged(
              auth,
              (user) => {
                if (!mounted) return

                console.log("HomePage: Auth state changed:", user ? "logged in" : "logged out")
                clearTimeout(firebaseTimeout)

                if (user) {
                  console.log("HomePage: Firebase user found:", user.email)
                  const userData = {
                    id: user.uid,
                    email: user.email || "",
                    name: user.displayName || "User",
                    profilePhoto: user.photoURL || "",
                  }
                  storage.setCurrentUser(userData)
                  setIsAuthenticated(true)
                  router.push("/dashboard")
                } else {
                  console.log("HomePage: No Firebase user, showing login form")
                  setIsAuthenticated(false)
                  setLoading(false)
                }
              },
              (error) => {
                console.error("HomePage: Auth state change error:", error)
                clearTimeout(firebaseTimeout)
                if (mounted) {
                  setIsAuthenticated(false)
                  setLoading(false)
                }
              },
            )
          } else {
            // Firebase not available or failed to initialize
            console.log("HomePage: Firebase auth not available, using local storage only")
            clearTimeout(firebaseTimeout)
            if (mounted) {
              setIsAuthenticated(false)
              setLoading(false)
            }
          }
        } catch (firebaseError) {
          console.log("HomePage: Firebase auth check failed:", firebaseError)
          clearTimeout(firebaseTimeout)
          if (mounted) {
            setIsAuthenticated(false)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("HomePage: Auth check error:", error)
        if (mounted) {
          setIsAuthenticated(false)
          setLoading(false)
        }
      }
    }

    checkAuth()

    // Cleanup function
    return () => {
      console.log("HomePage: Cleaning up")
      mounted = false
      if (authUnsubscribe) {
        authUnsubscribe()
      }
    }
  }, [router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <LoadingSpinner />
  }

  return <LoginForm />
}
