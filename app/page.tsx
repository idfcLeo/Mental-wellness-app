"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import LoadingSpinner from "@/components/loading-spinner"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")

        if (!auth) {
          setLoading(false)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            router.push("/dashboard")
          } else {
            setLoading(false)
          }
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Firebase initialization error:", error)
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
