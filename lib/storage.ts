// Local storage utilities for mood entries
export interface MoodEntry {
  id: string
  mood: string
  note: string
  timestamp: Date
  userId: string
}

export class LocalMoodStorage {
  private static getStorageKey(userId: string): string {
    return `mindfulme_moods_${userId}`
  }

  static saveEntry(userId: string, entry: Omit<MoodEntry, "id">): MoodEntry {
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(entry.timestamp),
    }

    const entries = this.getEntries(userId)
    entries.unshift(newEntry)

    // Keep only last 100 entries to prevent storage bloat
    const limitedEntries = entries.slice(0, 100)

    localStorage.setItem(this.getStorageKey(userId), JSON.stringify(limitedEntries))
    return newEntry
  }

  static getEntries(userId: string): MoodEntry[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey(userId))
      if (!stored) return []

      const entries = JSON.parse(stored)
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }))
    } catch (error) {
      console.warn("Error reading from localStorage:", error)
      return []
    }
  }

  static getRecentEntries(userId: string, limit = 5): MoodEntry[] {
    return this.getEntries(userId).slice(0, limit)
  }

  static clearEntries(userId: string): void {
    localStorage.removeItem(this.getStorageKey(userId))
  }
}
