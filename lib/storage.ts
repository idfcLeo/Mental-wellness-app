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
  profilePhoto?: string
}

export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: number
}

// Local Storage Functions
export const storage = {
  // User management
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    try {
      const user = localStorage.getItem("mindfulme_current_user")
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  },

  setCurrentUser: (user: User) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("mindfulme_current_user", JSON.stringify(user))

      // Also update in users list if it exists
      const users = JSON.parse(localStorage.getItem("mindfulme_users") || "[]")
      const userIndex = users.findIndex((u: User) => u.id === user.id)
      if (userIndex >= 0) {
        users[userIndex] = user
        localStorage.setItem("mindfulme_users", JSON.stringify(users))
      }
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  },

  clearCurrentUser: () => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem("mindfulme_current_user")
    } catch (error) {
      console.error("Error clearing current user:", error)
    }
  },

  // Mood entries
  getMoodEntries: (): MoodEntry[] => {
    if (typeof window === "undefined") return []
    try {
      const entries = localStorage.getItem("mindfulme_mood_entries")
      return entries ? JSON.parse(entries) : []
    } catch (error) {
      console.error("Error getting mood entries:", error)
      return []
    }
  },

  addMoodEntry: (entry: Omit<MoodEntry, "id">) => {
    if (typeof window === "undefined") return
    try {
      const entries = storage.getMoodEntries()
      const newEntry: MoodEntry = {
        ...entry,
        id: Date.now().toString(),
      }
      entries.unshift(newEntry)
      localStorage.setItem("mindfulme_mood_entries", JSON.stringify(entries))
      return newEntry
    } catch (error) {
      console.error("Error adding mood entry:", error)
    }
  },

  deleteMoodEntry: (id: string) => {
    if (typeof window === "undefined") return
    try {
      const entries = storage.getMoodEntries()
      const filtered = entries.filter((entry) => entry.id !== id)
      localStorage.setItem("mindfulme_mood_entries", JSON.stringify(filtered))
    } catch (error) {
      console.error("Error deleting mood entry:", error)
    }
  },

  // Chat history
  getChatHistory: (): ChatMessage[] => {
    if (typeof window === "undefined") return []
    try {
      const history = localStorage.getItem("mindfulme_chat_history")
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error("Error getting chat history:", error)
      return []
    }
  },

  addChatMessage: (message: ChatMessage) => {
    if (typeof window === "undefined") return
    try {
      const history = storage.getChatHistory()
      history.push(message)
      // Keep only last 100 messages to prevent storage bloat
      if (history.length > 100) {
        history.splice(0, history.length - 100)
      }
      localStorage.setItem("mindfulme_chat_history", JSON.stringify(history))
    } catch (error) {
      console.error("Error adding chat message:", error)
    }
  },

  clearChatHistory: () => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem("mindfulme_chat_history")
    } catch (error) {
      console.error("Error clearing chat history:", error)
    }
  },
}
