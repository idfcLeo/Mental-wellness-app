"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { storage } from "@/lib/storage"

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😢", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "😡", label: "Angry", value: "angry" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "🤗", label: "Grateful", value: "grateful" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
]

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood) return

    setLoading(true)

    try {
      const entry = {
        mood: selectedMood,
        note: note.trim(),
        timestamp: Date.now(),
        date: new Date().toISOString().split("T")[0],
      }

      storage.addMoodEntry(entry)

      toast({
        title: "Mood tracked!",
        description: "Your mood has been recorded successfully.",
      })

      setSelectedMood("")
      setNote("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save mood entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Mood Selection */}
      <div className="space-y-2 sm:space-y-3">
        <label className="text-sm font-medium text-gray-700">Select your current mood:</label>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {moods.map((mood) => (
            <button
              key={mood.value}
              type="button"
              onClick={() => setSelectedMood(mood.value)}
              className={`p-2 sm:p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                selectedMood === mood.value
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-lg sm:text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs text-gray-600">{mood.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Note */}
      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium text-gray-700">
          Add a note (optional):
        </label>
        <Input
          id="note"
          type="text"
          placeholder="How was your day? What's on your mind?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="bg-white/50"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!selectedMood || loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {loading ? "Saving..." : "Track Mood"}
      </Button>
    </form>
  )
}
