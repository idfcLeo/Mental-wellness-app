"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User, type MoodEntry } from "@/lib/storage"
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Heart } from "lucide-react"

const moodEmojis: { [key: string]: string } = {
  happy: "😊",
  sad: "😢",
  anxious: "😰",
  tired: "😴",
  angry: "😡",
  calm: "😌",
  grateful: "🤗",
  neutral: "😐",
}

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const router = useRouter()

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)

    const moodEntries = storage.getMoodEntries()
    setEntries(moodEntries)
    setLoading(false)
  }, [router])

  const getMoodStats = () => {
    const moodCounts = entries.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      },
      {} as { [key: string]: number },
    )

    const total = entries.length
    return Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }

  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayEntries = entries.filter((entry) => entry.date === date)
      return {
        date,
        count: dayEntries.length,
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      }
    })
  }

  const getStreakData = () => {
    const uniqueDates = [...new Set(entries.map((entry) => entry.date))].sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split("T")[0]

    // Calculate current streak
    if (uniqueDates.includes(today)) {
      currentStreak = 1
      const checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - 1)

      while (uniqueDates.includes(checkDate.toISOString().split("T")[0])) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
    } else if (uniqueDates.includes(yesterdayStr)) {
      const checkDate = yesterday
      while (uniqueDates.includes(checkDate.toISOString().split("T")[0])) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      }
    }

    // Calculate longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(uniqueDates[i - 1])
        const currDate = new Date(uniqueDates[i])
        const diffTime = currDate.getTime() - prevDate.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)

        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return { currentStreak, longestStreak }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const moodStats = getMoodStats()
  const weeklyData = getWeeklyData()
  const { currentStreak, longestStreak } = getStreakData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Mood Analytics</h1>
                <p className="text-sm text-gray-600">Insights into your emotional patterns</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {entries.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No data to analyze yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your mood to see meaningful insights and patterns.</p>
              <Button onClick={() => router.push("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
                Start Tracking
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{entries.length}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{new Set(entries.map((e) => e.date)).size}</div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{currentStreak}</div>
                  <div className="text-sm text-gray-600">Current Streak</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{longestStreak}</div>
                  <div className="text-sm text-gray-600">Longest Streak</div>
                </CardContent>
              </Card>
            </div>

            {/* Mood Distribution */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Mood Distribution</span>
                </CardTitle>
                <CardDescription>How often you experience different emotions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodStats.map(({ mood, count, percentage }) => (
                    <div key={mood} className="flex items-center space-x-4">
                      <div className="text-2xl">{moodEmojis[mood]}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium capitalize">{mood}</span>
                          <span className="text-sm text-gray-600">
                            {count} times ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Weekly Activity</span>
                </CardTitle>
                <CardDescription>Your mood tracking activity over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end space-x-2 h-32">
                  {weeklyData.map(({ date, count, day }) => (
                    <div key={date} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-purple-600 rounded-t w-full transition-all duration-300"
                        style={{
                          height: `${Math.max((count / Math.max(...weeklyData.map((d) => d.count))) * 100, 5)}%`,
                          minHeight: count > 0 ? "8px" : "2px",
                        }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2">{day}</div>
                      <div className="text-xs font-medium text-purple-600">{count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moodStats.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Most common mood:</strong> {moodEmojis[moodStats[0].mood]} {moodStats[0].mood}(
                        {moodStats[0].percentage}% of entries)
                      </p>
                    </div>
                  )}

                  {currentStreak > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Great job!</strong> You're on a {currentStreak}-day tracking streak. Keep it up!
                      </p>
                    </div>
                  )}

                  {entries.length >= 7 && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Consistency:</strong> You've been tracking for{" "}
                        {new Set(entries.map((e) => e.date)).size} different days. Regular tracking helps identify
                        patterns.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
