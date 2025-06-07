"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Music, Wind, Quote, ExternalLink } from "lucide-react"

const suggestions = [
  {
    type: "music",
    title: "Calming Music",
    description: "Relaxing playlists to help you unwind",
    icon: Music,
    color: "bg-green-100 text-green-600",
    items: [
      { name: "Peaceful Piano", url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO" },
      { name: "Nature Sounds", url: "https://open.spotify.com/playlist/37i9dQZF1DX8ymr6UES7vc" },
      { name: "Meditation Music", url: "https://open.spotify.com/playlist/37i9dQZF1DX9uKNf5jGX6m" },
    ],
  },
  {
    type: "breathing",
    title: "Breathing Exercises",
    description: "Guided breathing techniques for relaxation",
    icon: Wind,
    color: "bg-blue-100 text-blue-600",
    items: [
      { name: "4-7-8 Breathing", url: "https://www.youtube.com/watch?v=YRPh_GaiL8s" },
      { name: "Box Breathing", url: "https://www.youtube.com/watch?v=tEmt1Znux58" },
      { name: "Deep Breathing", url: "https://www.youtube.com/watch?v=DbDoBzGY3vo" },
    ],
  },
  {
    type: "quotes",
    title: "Motivational Quotes",
    description: "Inspiring words to brighten your day",
    icon: Quote,
    color: "bg-purple-100 text-purple-600",
    items: [
      { name: "You are stronger than you think.", url: "#" },
      { name: "Every small step counts towards progress.", url: "#" },
      { name: "Your mental health matters.", url: "#" },
    ],
  },
]

export default function SuggestionCards() {
  const handleItemClick = (url: string, name: string) => {
    if (url === "#") {
      // For quotes, just show a toast or modal
      return
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
      {suggestions.map((category) => {
        const IconComponent = category.icon
        return (
          <Card key={category.type} className="bg-white/50 border-0 shadow-md">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <div className={`p-1.5 sm:p-2 rounded-lg ${category.color}`}>
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span>{category.title}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 sm:space-y-2">
              {category.items.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-between text-left h-auto p-2 sm:p-3 hover:bg-white/80 text-xs sm:text-sm"
                  onClick={() => handleItemClick(item.url, item.name)}
                >
                  <span>{item.name}</span>
                  {item.url !== "#" && <ExternalLink className="h-3 w-3" />}
                </Button>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
