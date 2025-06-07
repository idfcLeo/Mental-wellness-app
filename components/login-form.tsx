"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Heart, Brain, Sparkles } from "lucide-react"

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (typeof window === "undefined") return

      // Try Firebase auth first
      try {
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")

        if (auth) {
          if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password)
          } else {
            await createUserWithEmailAndPassword(auth, email, password)
          }

          toast({
            title: "Success!",
            description: isLogin ? "Logged in successfully" : "Account created successfully",
          })

          router.push("/dashboard")
          return
        }
      } catch (firebaseError) {
        console.log("Firebase auth failed, using local storage fallback")
      }

      // Fallback to local storage
      const users = JSON.parse(localStorage.getItem("mindfulme_users") || "[]")

      if (isLogin) {
        const user = users.find((u: any) => u.email === email && u.password === password)
        if (user) {
          localStorage.setItem("mindfulme_current_user", JSON.stringify(user))
          toast({
            title: "Welcome back!",
            description: "Logged in successfully",
          })
          router.push("/dashboard")
        } else {
          throw new Error("Invalid credentials")
        }
      } else {
        const existingUser = users.find((u: any) => u.email === email)
        if (existingUser) {
          throw new Error("User already exists")
        }

        const newUser = { id: Date.now().toString(), email, password, name }
        users.push(newUser)
        localStorage.setItem("mindfulme_users", JSON.stringify(users))
        localStorage.setItem("mindfulme_current_user", JSON.stringify(newUser))

        toast({
          title: "Welcome!",
          description: "Account created successfully",
        })
        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
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

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-purple-600 hover:text-purple-700 underline"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Demo Account */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                <strong>Demo:</strong> email@demo.com / password123
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
