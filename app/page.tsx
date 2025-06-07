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
    const checkAuth = async () => {
      try {
        // Always start with loading
        setLoading(true)

        // Check local storage first
        const localUser = storage.getCurrentUser()

        if (localUser) {
          // User found in local storage, redirect to dashboard
          setIsAuthenticated(true)
          router.push("/dashboard")
          return
        }

        // Check Firebase auth if available
        if (typeof window !== "undefined") {
          try {
            const { onAuthStateChanged } = await import("firebase/auth")
            const { auth } = await import("@/lib/firebase")

            if (auth) {
              const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                  // Save Firebase user to local storage
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
                  // No user found, show login
                  setIsAuthenticated(false)
                  setLoading(false)
                }
              })

              // Cleanup subscription
              return () => unsubscribe()
            } else {
              // Firebase not available, show login
              setIsAuthenticated(false)
              setLoading(false)
            }
          } catch (firebaseError) {
            console.log("Firebase auth check failed:", firebaseError)
            setIsAuthenticated(false)
            setLoading(false)
          }
        } else {
          setIsAuthenticated(false)
          setLoading(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Force show login page if not authenticated
  if (loading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    return <LoadingSpinner />
  }

  return <LoginForm />
}
