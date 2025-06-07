"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Heart, Brain, Sparkles } from "lucide-react"
import { storage } from "@/lib/storage"

// Demo account credentials - keep consistent
const DEMO_EMAIL = "email@demo.com"
const DEMO_PASSWORD = "password123"

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Ensure demo account exists in localStorage on component mount
  useEffect(() => {
    // Create demo user if it doesn't exist
    try {
      const users = JSON.parse(localStorage.getItem("mindfulme_users") || "[]")
      const demoUserExists = users.some((u: any) => u.email === DEMO_EMAIL)

      if (!demoUserExists) {
        console.log("Creating demo user in localStorage")
        const demoUser = {
          id: "demo-user",
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
          name: "Demo User",
          profilePhoto: "",
          createdAt: new Date().toISOString(),
        }
        users.push(demoUser)
        localStorage.setItem("mindfulme_users", JSON.stringify(users))
      }
    } catch (error) {
      console.error("Error ensuring demo user exists:", error)
      // Create fresh users array with demo user
      const demoUser = {
        id: "demo-user",
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        name: "Demo User",
        profilePhoto: "",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem("mindfulme_users", JSON.stringify([demoUser]))
    }
  }, [])

  const handleDemoLogin = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setIsLogin(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log(`Attempting ${isLogin ? "login" : "signup"} for email: ${email}`)

      // Validate input
      if (!email.trim() || !password.trim()) {
        throw new Error("Please fill in all required fields")
      }

      if (!isLogin && !name.trim()) {
        throw new Error("Please enter your name")
      }

      // DIRECT DEMO ACCOUNT HANDLING
      // Special case for demo account - always works
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        console.log("Demo account login detected")
        const demoUser = {
          id: "demo-user",
          email: DEMO_EMAIL,
          name: "Demo User",
          profilePhoto: "",
        }
        storage.setCurrentUser(demoUser)
        toast({
          title: "Welcome to the demo!",
          description: "You're now logged in with the demo account.",
        })
        router.push("/dashboard")
        return
      }

      // FIREBASE AUTHENTICATION - Try first
      try {
        console.log("Attempting Firebase authentication...")

        // Import Firebase modules
        const { getFirebaseAuth, getFirebaseStatus } = await import("@/lib/firebase")

        // Log Firebase status for debugging
        const status = getFirebaseStatus()
        console.log("Firebase status:", status)

        if (!status.hasValidConfig) {
          console.log("Firebase config is invalid or missing, falling back to local auth")
          throw new Error("Firebase configuration not available")
        }

        // Get Firebase auth instance
        const auth = await getFirebaseAuth()

        if (!auth) {
          console.log("Firebase auth service not available, falling back to local auth")
          throw new Error("Firebase auth service not available")
        }

        console.log("Firebase auth service ready, proceeding with authentication")

        // Import Firebase auth methods
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import(
          "firebase/auth"
        )

        let userCredential
        if (isLogin) {
          console.log("Attempting Firebase sign in...")
          userCredential = await signInWithEmailAndPassword(auth, email, password)
          console.log("Firebase sign in successful!")
        } else {
          console.log("Attempting Firebase account creation...")
          userCredential = await createUserWithEmailAndPassword(auth, email, password)
          console.log("Firebase account created!")

          if (name.trim()) {
            console.log("Updating Firebase profile with display name...")
            await updateProfile(userCredential.user, { displayName: name.trim() })
            console.log("Firebase profile updated!")
          }
        }

        // Successfully authenticated with Firebase
        const user = userCredential.user
        console.log("Firebase authentication successful for:", user.email)

        // Store user in local storage
        storage.setCurrentUser({
          id: user.uid,
          email: user.email || "",
          name: user.displayName || name || "User",
          profilePhoto: user.photoURL || "",
        })

        toast({
          title: "Success!",
          description: isLogin ? "Logged in successfully" : "Account created successfully",
        })
        router.push("/dashboard")
        return
      } catch (firebaseError: any) {
        console.error("Firebase auth failed:", firebaseError)

        // Handle specific Firebase errors
        if (firebaseError.code) {
          switch (firebaseError.code) {
            case "auth/user-not-found":
            case "auth/wrong-password":
            case "auth/invalid-credential":
              console.log("Firebase auth failed with invalid credentials, trying local storage")
              break
            case "auth/email-already-in-use":
              throw new Error("Email is already registered")
            case "auth/weak-password":
              throw new Error("Password should be at least 6 characters")
            case "auth/invalid-email":
              throw new Error("Invalid email address")
            case "auth/too-many-requests":
              throw new Error("Too many failed attempts. Please try again later.")
            default:
              console.log("Firebase error, falling back to local storage:", firebaseError.code)
          }
        } else {
          console.log("Firebase auth failed without error code, falling back to local storage")
        }

        // Continue to local storage authentication as fallback
      }

      // LOCAL STORAGE AUTHENTICATION (Fallback)
      console.log("Using local storage authentication as fallback")

      // Get users from localStorage with error handling
      let users = []
      try {
        const usersData = localStorage.getItem("mindfulme_users")
        if (usersData) {
          users = JSON.parse(usersData)
          console.log(`Found ${users.length} users in localStorage`)
        } else {
          console.log("No users found in localStorage")
        }
      } catch (error) {
        console.error("Error reading users from localStorage:", error)
        users = []
      }

      // Handle login or signup
      if (isLogin) {
        // LOGIN MODE
        console.log("Checking login credentials against local users")

        // Debug: Log all users (without passwords)
        console.log(
          "Available users:",
          users.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name,
          })),
        )

        // Find matching user
        const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password)

        if (user) {
          console.log("Login successful for:", user.email)

          // Create a clean user object without password
          const { password: _, ...cleanUser } = user

          storage.setCurrentUser(cleanUser)
          toast({
            title: "Welcome back!",
            description: "Logged in successfully",
          })
          router.push("/dashboard")
        } else {
          console.log("No matching user found for login")
          throw new Error("Invalid email or password")
        }
      } else {
        // SIGNUP MODE
        console.log("Creating new user account")

        // Check if email already exists
        const existingUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

        if (existingUser) {
          throw new Error("Email is already registered")
        }

        // Validate password
        if (password.length < 6) {
          throw new Error("Password should be at least 6 characters")
        }

        // Create new user
        const newUser = {
          id: Date.now().toString(),
          email: email.toLowerCase(),
          password: password,
          name: name.trim() || "User",
          profilePhoto: "",
          createdAt: new Date().toISOString(),
        }

        // Add to users array
        users.push(newUser)
        localStorage.setItem("mindfulme_users", JSON.stringify(users))
        console.log("New user created:", newUser.email)

        // Store user without password
        const { password: _, ...cleanUser } = newUser
        storage.setCurrentUser(cleanUser)

        toast({
          title: "Welcome!",
          description: "Account created successfully",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-pink-500" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MindfulMe
          </h1>
          <p className="text-gray-600">Your personal wellness companion</p>
        </div>

        {/* Login/Signup Form */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{isLogin ? "Welcome back" : "Create account"}</CardTitle>
            <CardDescription className="text-center">
              {isLogin ? "Sign in to continue your wellness journey" : "Start your mental wellness journey today"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="bg-white/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {/* Demo Account Button */}
            <div className="mt-4">
              <Button type="button" variant="outline" className="w-full" onClick={handleDemoLogin} disabled={loading}>
                Try Demo Account
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setEmail("")
                  setPassword("")
                  setName("")
                }}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Demo Account Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                <strong>Demo Account:</strong>
                <br />
                Email: {DEMO_EMAIL}
                <br />
                Password: {DEMO_PASSWORD}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <p className="text-xs text-gray-600">Mood Tracking</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">AI Support</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Wellness Tips</p>
          </div>
        </div>
      </div>
    </div>
  )
}
