"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import MoodTracker from "@/components/mood-tracker"
import SuggestionCards from "@/components/suggestion-cards"
import LoadingSpinner from "@/components/loading-spinner"
import { LogOut, MessageCircle, BookOpen, TrendingUp, Cloud, HardDrive } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { LocalMoodStorage, type MoodEntry } from "@/lib/storage"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState("")
  const [moodNote, setMoodNote] = useState("")
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const [storageMode, setStorageMode] = useState<"local" | "firebase">("local")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    const initFirebase = async () => {
      try {
        const { onAuthStateChanged, signOut } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")

        if (!auth) {
          console.warn("Firebase not properly initialized, using local storage")
          setLoading(false)
          return
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user)

            // Try Firebase first, fallback to local storage
            try {
              await testFirebaseAccess(user.uid)
              setStorageMode("firebase")
              setFirebaseReady(true)
              loadRecentEntriesFromFirebase(user.uid)
            } catch (error) {
              console.warn("Firebase access failed, using local storage:", error)
              setStorageMode("local")
              loadRecentEntriesFromLocal(user.uid)
            }
          } else {
            router.push("/")
          }
          setLoading(false)
        })

        // Store Firebase functions for later use
        ;(window as any).firebaseFunctions = {
          signOut,
          auth,
        }

        return () => unsubscribe()
      } catch (error) {
        console.error("Firebase initialization error:", error)
        setLoading(false)
      }
    }

    initFirebase()
  }, [router])

  const testFirebaseAccess = async (userId: string) => {
    const { collection, query, where, limit, getDocs } = await import("firebase/firestore")
    const { db } = await import("@/lib/firebase")

    if (!db) throw new Error("Firestore not available")

    // Test query to check permissions
    const testQuery = query(collection(db, "moodEntries"), where("userId", "==", userId), limit(1))

    await getDocs(testQuery)
  }

  const loadRecentEntriesFromLocal = (userId: string) => {
    const entries = LocalMoodStorage.getRecentEntries(userId, 5)
    setRecentEntries(entries)
  }

  const loadRecentEntriesFromFirebase = async (userId: string) => {
    try {
      const { collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebase")

      if (!db) throw new Error("Firestore not available")

      const q = query(
        collection(db, "moodEntries"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(5),
      )

      const querySnapshot = await getDocs(q)
      const entries: MoodEntry[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        entries.push({
          id: doc.id,
          mood: data.mood,
          note: data.note,
          timestamp: data.timestamp?.toDate() || new Date(),
          userId: data.userId,
        })
      })

      setRecentEntries(entries)
    } catch (error) {
      console.error("Error loading from Firebase:", error)
      // Fallback to local storage
      setStorageMode("local")
      loadRecentEntriesFromLocal(userId)
    }
  }

  const handleMoodSubmit = async () => {
    if (!selectedMood || !user) return

    setSubmitting(true)
    try {
      const moodEntry = {
        mood: selectedMood,
        note: moodNote,
        timestamp: new Date(),
        userId: user.uid,
      }

      if (storageMode === "firebase" && firebaseReady) {
        // Try Firebase first
        try {
          const { collection, addDoc, serverTimestamp } = await import("firebase/firestore")
          const { db } = await import("@/lib/firebase")

          if (db) {
            await addDoc(collection(db, "moodEntries"), {
              ...moodEntry,
              timestamp: serverTimestamp(),
            })

            toast({
              title: "Mood logged! 🎉",
              description: "Saved to cloud storage.",
            })

            // Reload from Firebase
            loadRecentEntriesFromFirebase(user.uid)
          } else {
            throw new Error("Firestore not available")
          }
        } catch (error) {
          console.warn("Firebase save failed, using local storage:", error)
          // Fallback to local storage
          setStorageMode("local")
          LocalMoodStorage.saveEntry(user.uid, moodEntry)
          loadRecentEntriesFromLocal(user.uid)

          toast({
            title: "Mood logged! 📱",
            description: "Saved locally on your device.",
          })
        }
      } else {
        // Use local storage
        LocalMoodStorage.saveEntry(user.uid, moodEntry)
        loadRecentEntriesFromLocal(user.uid)

        toast({
          title: "Mood logged! 📱",
          description: "Saved locally on your device.",
        })
      }

      setSelectedMood("")
      setMoodNote("")
    } catch (error: any) {
      console.error("Error submitting mood:", error)
      toast({
        title: "Error",
        description: "Failed to log mood. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (firebaseReady && (window as any).firebaseFunctions) {
        const { signOut, auth } = (window as any).firebaseFunctions
        await signOut(auth)
      }

      toast({
        title: "Logged out",
        description: "See you soon! 👋",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">MindfulMe</h1>

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

            <div className="flex items-center space-x-4">
              <Link href="/chatbot">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat Support</span>
                </Button>
              </Link>
              <Link href="/journal">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Journal</span>
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.email?.split("@")[0]}! 👋</h2>
          <p className="text-gray-600">How are you feeling today?</p>

          {storageMode === "local" && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                📱 Your mood data is being saved locally on this device.
                {firebaseReady ? " Cloud sync will be available once database permissions are configured." : ""}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mood Tracking */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span>Track Your Mood</span>
                </CardTitle>
                <CardDescription>Select how you're feeling right now and add any notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MoodTracker selectedMood={selectedMood} onMoodSelect={setSelectedMood} />

                <Textarea
                  placeholder="How was your day? What's on your mind? (optional)"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="min-h-[100px]"
                />

                <Button
                  onClick={handleMoodSubmit}
                  disabled={!selectedMood || submitting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {submitting ? "Logging..." : "Log Mood"}
                </Button>
              </CardContent>
            </Card>

            <SuggestionCards mood={selectedMood} />
          </div>

          {/* Recent Entries */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Entries</span>
                  {storageMode === "firebase" ? (
                    <Cloud className="w-4 h-4 text-blue-500" />
                  ) : (
                    <HardDrive className="w-4 h-4 text-gray-500" />
                  )}
                </CardTitle>
                <CardDescription>Your mood history</CardDescription>
              </CardHeader>
              <CardContent>
                {recentEntries.length > 0 ? (
                  <div className="space-y-3">
                    {recentEntries.map((entry) => (
                      <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xl">{entry.mood}</span>
                          <span className="text-xs text-gray-500">
                            {entry.timestamp instanceof Date
                              ? entry.timestamp.toLocaleDateString()
                              : new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.note && <p className="text-sm text-gray-600 truncate">{entry.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-3">
                    <div className="text-4xl">📝</div>
                    <p className="text-gray-500">No entries yet</p>
                    <p className="text-sm text-gray-400">Start tracking your mood above!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
