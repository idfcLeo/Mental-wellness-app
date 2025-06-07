"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Wind, Quote, ExternalLink } from "lucide-react"

interface SuggestionCardsProps {
  mood: string
}

const suggestions = {
  "😊": {
    music: ["Upbeat Pop Playlist", "Feel Good Hits", "Happy Vibes"],
    breathing: ["Energizing Breath", "Joy Breathing"],
    quotes: [
      "Happiness is not something ready made. It comes from your own actions.",
      "The purpose of our lives is to be happy.",
      "Happiness is a choice, not a result.",
    ],
  },
  "😢": {
    music: ["Healing Melodies", "Comfort Songs", "Gentle Instrumentals"],
    breathing: ["Calming Breath", "Emotional Release Breathing"],
    quotes: ["This too shall pass.", "It's okay to not be okay sometimes.", "Every storm runs out of rain."],
  },
  "😰": {
    music: ["Anxiety Relief", "Peaceful Sounds", "Nature Sounds"],
    breathing: ["4-7-8 Breathing", "Box Breathing", "Anxiety Relief Breath"],
    quotes: [
      "You are braver than you believe, stronger than you seem.",
      "Anxiety is temporary, but you are permanent.",
      "One breath at a time, one step at a time.",
    ],
  },
  "😴": {
    music: ["Sleep Sounds", "Relaxing Piano", "White Noise"],
    breathing: ["Sleep Breathing", "Deep Relaxation"],
    quotes: [
      "Rest when you're weary. Refresh and renew yourself.",
      "Taking care of yourself is not selfish.",
      "Your body needs rest to heal and grow.",
    ],
  },
  default: {
    music: ["Mindful Music", "Meditation Sounds", "Peaceful Playlist"],
    breathing: ["Basic Breathing", "Mindful Breathing"],
    quotes: [
      "Be present in all things and thankful for all things.",
      "The present moment is the only time over which we have dominion.",
      "Mindfulness is about being fully awake in our lives.",
    ],
  },
}

export default function SuggestionCards({ mood }: SuggestionCardsProps) {
  const currentSuggestions = suggestions[mood as keyof typeof suggestions] || suggestions.default

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Music Suggestions */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-green-500" />
            <span>Music Therapy</span>
          </CardTitle>
          <CardDescription>Curated playlists for your mood</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSuggestions.music.map((playlist, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between text-left"
              onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(playlist)}`, "_blank")}
            >
              <span>{playlist}</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Breathing Exercises */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wind className="w-5 h-5 text-blue-500" />
            <span>Breathing Exercises</span>
          </CardTitle>
          <CardDescription>Guided breathing techniques</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSuggestions.breathing.map((exercise, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-between text-left"
              onClick={() =>
                window.open(
                  `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise + " guided")}`,
                  "_blank",
                )
              }
            >
              <span>{exercise}</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Motivational Quotes */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Quote className="w-5 h-5 text-purple-500" />
            <span>Daily Inspiration</span>
          </CardTitle>
          <CardDescription>Uplifting quotes for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentSuggestions.quotes.map((quote, index) => (
            <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm italic text-gray-700">"{quote}"</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
