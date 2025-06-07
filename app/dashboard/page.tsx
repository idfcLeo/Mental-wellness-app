"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User } from "@/lib/storage"
import MoodTracker from "@/components/mood-tracker"
import SuggestionCards from "@/components/suggestion-cards"
import { Heart, Brain, BookOpen, MessageCircle, LogOut, BarChart3 } from "lucide-react"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    storage.clearCurrentUser()
    router.push("/")
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <Brain className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">MindfulMe</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name || "Friend"}!</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white/50 hover:bg-white/80"
            onClick={() => router.push("/chatbot")}
          >
            <MessageCircle className="h-6 w-6 text-purple-600" />
            <span className="text-sm">AI Chat</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white/50 hover:bg-white/80"
            onClick={() => router.push("/journal")}
          >
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-sm">Journal</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white/50 hover:bg-white/80"
            onClick={() => router.push("/analytics")}
          >
            <BarChart3 className="h-6 w-6 text-green-600" />
            <span className="text-sm">Analytics</span>
          </Button>

          <Button
            variant="outline"
            className="h-20 flex-col space-y-2 bg-white/50 hover:bg-white/80"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
          >
            <Heart className="h-6 w-6 text-pink-600" />
            <span className="text-sm">Wellness</span>
          </Button>
        </div>

        {/* Mood Tracker */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <span>How are you feeling today?</span>
            </CardTitle>
            <CardDescription>Track your mood and add optional notes about your day</CardDescription>
          </CardHeader>
          <CardContent>
            <MoodTracker />
          </CardContent>
        </Card>

        {/* Wellness Suggestions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span>Wellness Suggestions</span>
            </CardTitle>
            <CardDescription>Personalized recommendations for your mental wellness</CardDescription>
          </CardHeader>
          <CardContent>
            <SuggestionCards />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
