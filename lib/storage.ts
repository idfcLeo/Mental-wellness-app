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
  createdAt?: string
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
      const userData = user ? JSON.parse(user) : null
      console.log("Storage: getCurrentUser:", userData ? "found user" : "no user")
      return userData
    } catch (error) {
      console.error("Storage: Error getting current user:", error)
      return null
    }
  },

  setCurrentUser: (user: User) => {
    if (typeof window === "undefined") return
    try {
      console.log("Storage: Setting current user:", user.email)

      // Ensure we're not losing the profile photo if it exists
      const currentUser = localStorage.getItem("mindfulme_current_user")
      const existingUser = currentUser ? JSON.parse(currentUser) : null

      // If we have an existing user with a profile photo and the new user doesn't have one,
      // keep the existing profile photo
      if (existingUser?.profilePhoto && !user.profilePhoto) {
        user.profilePhoto = existingUser.profilePhoto
      }

      localStorage.setItem("mindfulme_current_user", JSON.stringify(user))

      // Also update in users list if it exists
      const users = JSON.parse(localStorage.getItem("mindfulme_users") || "[]")
      const userIndex = users.findIndex((u: any) => u.id === user.id)
      if (userIndex >= 0) {
        // Preserve profile photo if not provided in the update
        if (!user.profilePhoto && users[userIndex].profilePhoto) {
          user.profilePhoto = users[userIndex].profilePhoto
        }
        // Update user data but preserve password if it exists
        users[userIndex] = { ...users[userIndex], ...user }
        localStorage.setItem("mindfulme_users", JSON.stringify(users))
      }

      console.log("Storage: Current user set successfully")
    } catch (error) {
      console.error("Storage: Error setting current user:", error)
    }
  },

  clearCurrentUser: () => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem("mindfulme_current_user")
      console.log("Storage: Current user cleared")
    } catch (error) {
      console.error("Storage: Error clearing current user:", error)
    }
  },

  // Debug function to check stored users
  getStoredUsers: () => {
    if (typeof window === "undefined") return []
    try {
      const users = JSON.parse(localStorage.getItem("mindfulme_users") || "[]")
      console.log("Storage: Found", users.length, "stored users")
      return users.map((u: any) => ({ email: u.email, name: u.name, id: u.id })) // Don't expose passwords
    } catch (error) {
      console.error("Storage: Error getting stored users:", error)
      return []
    }
  },

  // Mood entries
  getMoodEntries: (): MoodEntry[] => {
    if (typeof window === "undefined") return []
    try {
      const entries = localStorage.getItem("mindfulme_mood_entries")
      return entries ? JSON.parse(entries) : []
    } catch (error) {
      console.error("Storage: Error getting mood entries:", error)
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
      console.error("Storage: Error adding mood entry:", error)
    }
  },

  deleteMoodEntry: (id: string) => {
    if (typeof window === "undefined") return
    try {
      const entries = storage.getMoodEntries()
      const filtered = entries.filter((entry) => entry.id !== id)
      localStorage.setItem("mindfulme_mood_entries", JSON.stringify(filtered))
    } catch (error) {
      console.error("Storage: Error deleting mood entry:", error)
    }
  },

  // Chat history
  getChatHistory: (): ChatMessage[] => {
    if (typeof window === "undefined") return []
    try {
      const history = localStorage.getItem("mindfulme_chat_history")
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error("Storage: Error getting chat history:", error)
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
      console.error("Storage: Error adding chat message:", error)
    }
  },

  clearChatHistory: () => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem("mindfulme_chat_history")
    } catch (error) {
      console.error("Storage: Error clearing chat history:", error)
    }
  },
}
