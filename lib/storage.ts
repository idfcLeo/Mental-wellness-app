"use client"

export interface MoodEntry {
  id: string
  mood: string
  note?: string
  timestamp: number
  date: string
}

export interface User {
  id: string
  email: string
  name: string
}

// Local Storage Functions
export const storage = {
  // User management
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem("mindfulme_current_user")
    return user ? JSON.parse(user) : null
  },

  setCurrentUser: (user: User) => {
    if (typeof window === "undefined") return
    localStorage.setItem("mindfulme_current_user", JSON.stringify(user))
  },

  clearCurrentUser: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("mindfulme_current_user")
  },

  // Mood entries
  getMoodEntries: (): MoodEntry[] => {
    if (typeof window === "undefined") return []
    const entries = localStorage.getItem("mindfulme_mood_entries")
    return entries ? JSON.parse(entries) : []
  },

  addMoodEntry: (entry: Omit<MoodEntry, "id">) => {
    if (typeof window === "undefined") return
    const entries = storage.getMoodEntries()
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
    }
    entries.unshift(newEntry)
    localStorage.setItem("mindfulme_mood_entries", JSON.stringify(entries))
    return newEntry
  },

  deleteMoodEntry: (id: string) => {
    if (typeof window === "undefined") return
    const entries = storage.getMoodEntries()
    const filtered = entries.filter((entry) => entry.id !== id)
    localStorage.setItem("mindfulme_mood_entries", JSON.stringify(filtered))
  },

  // Chat history
  getChatHistory: (): any[] => {
    if (typeof window === "undefined") return []
    const history = localStorage.getItem("mindfulme_chat_history")
    return history ? JSON.parse(history) : []
  },

  addChatMessage: (message: any) => {
    if (typeof window === "undefined") return
    const history = storage.getChatHistory()
    history.push(message)
    localStorage.setItem("mindfulme_chat_history", JSON.stringify(history))
  },

  clearChatHistory: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("mindfulme_chat_history")
  },
}
