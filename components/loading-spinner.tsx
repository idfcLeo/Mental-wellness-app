"use client"

import { Brain, Heart, Sparkles, Sun, Moon, Star } from "lucide-react"
import { useEffect, useState } from "react"

export default function LoadingSpinner() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Icons Circle */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Center Heart */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="h-8 w-8 text-pink-500 animate-pulse" fill="currentColor" />
          </div>

          {/* Rotating Brain */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
            <Brain className="h-6 w-6 text-purple-500 absolute top-0 left-1/2 transform -translate-x-1/2" />
          </div>

          {/* Counter-rotating Sparkles */}
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "4s", animationDirection: "reverse" }}
          >
            <Sparkles className="h-5 w-5 text-yellow-400 absolute top-2 right-2" />
            <Sparkles className="h-4 w-4 text-blue-400 absolute bottom-2 left-2" />
          </div>

          {/* Floating Sun and Moon */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "6s" }}>
            <Sun className="h-5 w-5 text-orange-400 absolute right-0 top-1/2 transform -translate-y-1/2" />
          </div>

          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "5s", animationDirection: "reverse" }}
          >
            <Moon className="h-5 w-5 text-indigo-400 absolute left-0 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Twinkling Stars */}
          <div className="absolute inset-0">
            <Star
              className="h-3 w-3 text-purple-300 absolute top-4 right-4 animate-ping"
              style={{ animationDelay: "0s" }}
            />
            <Star
              className="h-3 w-3 text-pink-300 absolute bottom-4 right-8 animate-ping"
              style={{ animationDelay: "1s" }}
            />
            <Star
              className="h-3 w-3 text-blue-300 absolute bottom-8 left-4 animate-ping"
              style={{ animationDelay: "2s" }}
            />
          </div>

          {/* Outer Glow Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>

          {/* Rotating Gradient Ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-spin"
            style={{
              mask: "conic-gradient(transparent 270deg, white 360deg)",
              WebkitMask: "conic-gradient(transparent 270deg, white 360deg)",
              animationDuration: "2s",
            }}
          ></div>
        </div>

        {/* Animated Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            MindfulMe
          </h2>

          {/* Loading Text with Animated Dots */}
          <div className="text-gray-600">
            <span>Preparing your wellness journey{dots}</span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }}></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }}></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.9s" }}></div>
        </div>

        {/* Skip Button (appears after 2 seconds) */}
        <div className="pt-4">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-purple-600 hover:text-purple-700 underline opacity-70 hover:opacity-100 transition-opacity"
          >
            Taking too long? Click to refresh
          </button>
        </div>
      </div>
    </div>
  )
}
