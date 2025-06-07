"use client"

import { Button } from "@/components/ui/button"

const moods = [
  { emoji: "😊", label: "Happy", value: "😊" },
  { emoji: "😢", label: "Sad", value: "😢" },
  { emoji: "😰", label: "Anxious", value: "😰" },
  { emoji: "😴", label: "Tired", value: "😴" },
  { emoji: "😡", label: "Angry", value: "😡" },
  { emoji: "😌", label: "Calm", value: "😌" },
  { emoji: "🤗", label: "Grateful", value: "🤗" },
  { emoji: "😕", label: "Confused", value: "😕" },
]

interface MoodTrackerProps {
  selectedMood: string
  onMoodSelect: (mood: string) => void
}

export default function MoodTracker({ selectedMood, onMoodSelect }: MoodTrackerProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {moods.map((mood) => (
        <Button
          key={mood.value}
          variant={selectedMood === mood.value ? "default" : "outline"}
          className={`h-20 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
            selectedMood === mood.value
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105"
              : "hover:scale-105"
          }`}
          onClick={() => onMoodSelect(mood.value)}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs">{mood.label}</span>
        </Button>
      ))}
    </div>
  )
}
