"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { storage, type User } from "@/lib/storage"
import { ArrowLeft, Send, Bot, UserIcon, Heart, Brain } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: number
}

export default function ChatbotPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)

    // Load chat history
    const history = storage.getChatHistory()
    setMessages(history)

    // Add welcome message if no history
    if (history.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Hello ${currentUser.name || "there"}! I'm your AI wellness companion. I'm here to listen and provide emotional support. How are you feeling today?`,
        sender: "bot",
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])
      storage.addChatMessage(welcomeMessage)
    }

    setLoading(false)
  }, [router])

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Emotional support responses
    if (lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("down")) {
      const responses = [
        "I hear that you're feeling sad. It's completely normal to have these feelings. Would you like to talk about what's making you feel this way?",
        "I'm sorry you're going through a difficult time. Remember that it's okay to feel sad - these emotions are valid. What usually helps you feel a bit better?",
        "Thank you for sharing how you're feeling. Sadness can be overwhelming, but you're not alone. Have you tried any breathing exercises or listening to calming music today?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (lowerMessage.includes("anxious") || lowerMessage.includes("worried") || lowerMessage.includes("stress")) {
      const responses = [
        "Anxiety can feel overwhelming. Let's try to ground ourselves. Can you name 5 things you can see around you right now?",
        "I understand you're feeling anxious. Try taking slow, deep breaths. Breathe in for 4 counts, hold for 4, then exhale for 4. Would you like me to guide you through this?",
        "Stress and worry are natural responses. What's one small thing you could do right now to take care of yourself?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (lowerMessage.includes("happy") || lowerMessage.includes("good") || lowerMessage.includes("great")) {
      const responses = [
        "That's wonderful to hear! I'm so glad you're feeling good. What's contributing to your positive mood today?",
        "It makes me happy to know you're doing well! Would you like to share what's bringing you joy?",
        "That's fantastic! Celebrating the good moments is so important for our mental health.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (lowerMessage.includes("angry") || lowerMessage.includes("frustrated") || lowerMessage.includes("mad")) {
      const responses = [
        "I can sense your frustration. Anger is a valid emotion. What's causing these feelings right now?",
        "It sounds like you're dealing with some difficult emotions. Would it help to talk through what's making you angry?",
        "Anger can be intense. Sometimes it helps to take a step back and breathe. What triggered these feelings?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
      return "I'm here to support you. While I can provide emotional support and coping strategies, please remember that if you're having thoughts of self-harm, it's important to reach out to a mental health professional or crisis hotline immediately. What kind of support are you looking for today?"
    }

    if (lowerMessage.includes("sleep") || lowerMessage.includes("tired")) {
      return "Sleep is so important for our mental health. Are you having trouble sleeping? Some things that might help include creating a bedtime routine, avoiding screens before bed, or trying some relaxation techniques."
    }

    // Default supportive responses
    const defaultResponses = [
      "Thank you for sharing that with me. How does talking about this make you feel?",
      "I'm listening. Can you tell me more about what you're experiencing?",
      "That sounds important to you. What thoughts come up when you think about this?",
      "I appreciate you opening up. What would be most helpful for you right now?",
      "It takes courage to share your feelings. What support do you need in this moment?",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    storage.addChatMessage(userMessage)
    setInputMessage("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(
      () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: generateBotResponse(inputMessage),
          sender: "bot",
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, botResponse])
        storage.addChatMessage(botResponse)
        setIsTyping(false)
      },
      1000 + Math.random() * 2000,
    ) // 1-3 second delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-purple-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI Wellness Chat</h1>
                <p className="text-sm text-gray-600">Your supportive companion</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-200px)] bg-white/80 backdrop-blur-sm border-0 shadow-lg flex flex-col">
          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === "user" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {message.sender === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts and feelings..."
                className="flex-1 bg-white/50"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This is an AI companion for emotional support. For crisis situations, please contact a mental health
              professional.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
