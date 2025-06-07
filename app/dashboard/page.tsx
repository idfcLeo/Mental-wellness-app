"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User } from "@/lib/storage"
import MoodTracker from "@/components/mood-tracker"
import SuggestionCards from "@/components/suggestion-cards"
import { Heart, Brain, BookOpen, MessageCircle, LogOut, BarChart3, UserIcon, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  const handleLogout = async () => {
    try {
      // Try to sign out from Firebase if available
      try {
        const { signOut } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")

        if (auth) {
          await signOut(auth)
        }
      } catch (firebaseError) {
        console.log("Firebase signout failed, continuing with local logout")
      }

      // Clear local storage
      storage.clearCurrentUser()

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if there's an error
      storage.clearCurrentUser()
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">MindfulMe</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Welcome, {user?.name || "Friend"}!
                  {user?.id === "demo-user" && (
                    <span className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Demo
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Profile Photo */}
              <button
                onClick={() => router.push("/account")}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                )}
              </button>

              {/* Desktop Menu */}
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/account")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Account
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>

              {/* Mobile Logout */}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Demo Account Notice */}
        {user?.id === "demo-user" && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-xs sm:text-sm text-blue-700">
                  <strong>Demo Mode:</strong> You're using the demo account. All data is stored locally.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Button
            variant="outline"
            className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 bg-white/50 hover:bg-white/80 text-xs sm:text-sm"
            onClick={() => router.push("/chatbot")}
          >
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            <span>AI Chat</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 bg-white/50 hover:bg-white/80 text-xs sm:text-sm"
            onClick={() => router.push("/journal")}
          >
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <span>Journal</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 bg-white/50 hover:bg-white/80 text-xs sm:text-sm"
            onClick={() => router.push("/analytics")}
          >
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            <span>Analytics</span>
          </Button>

          <Button
            variant="outline"
            className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 bg-white/50 hover:bg-white/80 text-xs sm:text-sm"
            onClick={() => router.push("/account")}
          >
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            <span>Account</span>
          </Button>
        </div>

        {/* Mood Tracker */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
              <span>How are you feeling today?</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Track your mood and add optional notes about your day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoodTracker />
          </CardContent>
        </Card>

        {/* Wellness Suggestions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <span>Wellness Suggestions</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Personalized recommendations for your mental wellness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuggestionCards />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
