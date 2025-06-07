"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, TrendingUp, Cloud, HardDrive } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/loading-spinner"
import { LocalMoodStorage, type MoodEntry } from "@/lib/storage"

export default function JournalPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [storageMode, setStorageMode] = useState<"local" | "firebase">("local")
  const router = useRouter()

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const initFirebase = async () => {
      try {
        const { onAuthStateChanged } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")

        if (!auth) {
          router.push("/")
          return
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user)

            // Try Firebase first, fallback to local storage
            testFirebaseAndLoadEntries(user.uid)
          } else {
            router.push("/")
          }
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Firebase initialization error:", error)
        router.push("/")
      }
    }

    initFirebase()
  }, [router])

  const testFirebaseAndLoadEntries = async (userId: string) => {
    setLoadingEntries(true)

    try {
      // Test Firebase access
      const { collection, query, where, orderBy, getDocs } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebase")

      if (!db) throw new Error("Firestore not available")

      const q = query(collection(db, "moodEntries"), where("userId", "==", userId), orderBy("timestamp", "desc"))

      const querySnapshot = await getDocs(q)
      const firebaseEntries: MoodEntry[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        firebaseEntries.push({
          id: doc.id,
          mood: data.mood,
          note: data.note,
          timestamp: data.timestamp?.toDate() || new Date(),
          userId: data.userId,
        })
      })

      setEntries(firebaseEntries)
      setStorageMode("firebase")
    } catch (error) {
      console.warn("Firebase access failed, using local storage:", error)

      // Fallback to local storage
      const localEntries = LocalMoodStorage.getEntries(userId)
      setEntries(localEntries)
      setStorageMode("local")
    } finally {
      setLoadingEntries(false)
    }
  }

  const getMoodStats = () => {
    const moodCounts: { [key: string]: number } = {}
    entries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    })
    return moodCounts
  }

  const formatDate = (timestamp: Date | any) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Recent"
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const moodStats = getMoodStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h1 className="text-xl font-bold text-gray-800">Mood Journal</h1>

                {/* Storage indicator */}
                <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                  {storageMode === "firebase" ? (
                    <Cloud className="w-3 h-3 text-blue-500" />
                  ) : (
                    <HardDrive className="w-3 h-3 text-gray-500" />
                  )}
                  <span className="text-xs text-gray-600">{storageMode === "firebase" ? "Cloud" : "Local"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {storageMode === "local" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              📱 Your journal entries are stored locally on this device. Cloud sync will be available once database
              permissions are configured.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span>Mood Overview</span>
                </CardTitle>
                <CardDescription>Your emotional patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{entries.length}</p>
                    <p className="text-sm text-gray-600">Total Entries</p>
                  </div>

                  {Object.entries(moodStats).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Most Common Moods</h4>
                      {Object.entries(moodStats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([mood, count]) => (
                          <div key={mood} className="flex items-center justify-between">
                            <span className="text-lg">{mood}</span>
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Journal Entries */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Mood Journey</h2>
              <p className="text-gray-600">Reflecting on your emotional wellness over time</p>
            </div>

            {loadingEntries ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : entries.length > 0 ? (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{entry.mood}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800">{formatDate(entry.timestamp)}</h3>
                          </div>
                          {entry.note && <p className="text-gray-700 leading-relaxed">{entry.note}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No entries yet</h3>
                  <p className="text-gray-600 mb-4">Start tracking your mood to see your journey here</p>
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Track Your Mood
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
