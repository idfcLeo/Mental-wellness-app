"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User, type MoodEntry } from "@/lib/storage"
import { ArrowLeft, Calendar, Trash2, Heart, Brain, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const moodColors: { [key: string]: string } = {
  happy: "bg-yellow-100 text-yellow-800 border-yellow-200",
  sad: "bg-blue-100 text-blue-800 border-blue-200",
  anxious: "bg-orange-100 text-orange-800 border-orange-200",
  tired: "bg-gray-100 text-gray-800 border-gray-200",
  angry: "bg-red-100 text-red-800 border-red-200",
  calm: "bg-green-100 text-green-800 border-green-200",
  grateful: "bg-pink-100 text-pink-800 border-pink-200",
  neutral: "bg-purple-100 text-purple-800 border-purple-200",
}

export default function JournalPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadEntries()
    setLoading(false)
  }, [router])

  const loadEntries = () => {
    const moodEntries = storage.getMoodEntries()
    setEntries(moodEntries)
  }

  const deleteEntry = (id: string) => {
    storage.deleteMoodEntry(id)
    loadEntries()
    toast({
      title: "Entry deleted",
      description: "Your mood entry has been removed.",
    })
  }

  const filteredEntries = selectedDate ? entries.filter((entry) => entry.date === selectedDate) : entries

  const groupedEntries = filteredEntries.reduce(
    (groups, entry) => {
      const date = entry.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(entry)
      return groups
    },
    {} as { [key: string]: MoodEntry[] },
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateString === today.toISOString().split("T")[0]) {
      return "Today"
    } else if (dateString === yesterday.toISOString().split("T")[0]) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journal...</p>
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
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-purple-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Mood Journal</h1>
                <p className="text-sm text-gray-600">Track your emotional journey</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={() => router.push("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Date Filter */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <span>Filter by Date</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white/50"
              />
              <Button variant="outline" onClick={() => setSelectedDate("")} disabled={!selectedDate}>
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Journal Entries */}
        {Object.keys(groupedEntries).length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No journal entries yet</h3>
              <p className="text-gray-500 mb-4">Start tracking your mood to see your emotional journey over time.</p>
              <Button onClick={() => router.push("/dashboard")} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, dateEntries]) => (
                <Card key={date} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{formatDate(date)}</CardTitle>
                    <CardDescription>
                      {dateEntries.length} {dateEntries.length === 1 ? "entry" : "entries"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dateEntries
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start justify-between p-4 bg-white/50 rounded-lg border"
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="text-2xl">{moodEmojis[entry.mood]}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                    moodColors[entry.mood]
                                  }`}
                                >
                                  {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              {entry.note && (
                                <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">{entry.note}</p>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Stats Summary */}
        {entries.length > 0 && (
          <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <span>Journal Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{entries.length}</div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{new Set(entries.map((e) => e.date)).size}</div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {entries.filter((e) => e.note && e.note.trim()).length}
                  </div>
                  <div className="text-sm text-gray-600">With Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">
                    {entries.length > 0
                      ? moodEmojis[
                          Object.entries(
                            entries.reduce(
                              (acc, entry) => {
                                acc[entry.mood] = (acc[entry.mood] || 0) + 1
                                return acc
                              },
                              {} as { [key: string]: number },
                            ),
                          ).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral"
                        ]
                      : "😐"}
                  </div>
                  <div className="text-sm text-gray-600">Most Common</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
