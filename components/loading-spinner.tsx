"use client"

import { Brain, Heart } from "lucide-react"

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="flex justify-center items-center space-x-2 animate-pulse">
            <Heart className="h-8 w-8 text-pink-500" />
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Loading MindfulMe...</h2>
        <p className="text-gray-500">Preparing your wellness journey</p>
      </div>
    </div>
  )
}
