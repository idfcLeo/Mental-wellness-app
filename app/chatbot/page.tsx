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

  // Update the generateBotResponse function to be more responsive and accurate

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Direct question answering
    if (lowerMessage.includes("who are you") || lowerMessage.includes("what are you")) {
      return "I'm your AI wellness companion, designed to provide emotional support and a listening ear. I'm here to help you process your feelings and provide guidance when needed. How can I support you today?"
    }

    if (lowerMessage.includes("what can you do") || lowerMessage.includes("how can you help")) {
      return "I can listen to your concerns, provide emotional support, suggest coping strategies for different moods, and be a judgment-free space for you to express yourself. I can also help with simple breathing exercises or relaxation techniques. What would be most helpful for you right now?"
    }

    // Specific mental health concerns
    if (lowerMessage.includes("depress") || lowerMessage.includes("suicid") || lowerMessage.includes("kill myself")) {
      return "I'm really concerned about what you're sharing. While I'm here to support you, if you're having thoughts of harming yourself, please reach out to a crisis helpline immediately - like the 988 Suicide & Crisis Lifeline (call or text 988) or text HOME to 741741 to reach the Crisis Text Line. These services have trained counselors available 24/7. Your life matters, and professional help is available."
    }

    // Direct responses to user statements
    if (
      lowerMessage.includes("i feel overwhelmed") ||
      lowerMessage.includes("too much") ||
      lowerMessage.includes("can't handle")
    ) {
      return "It sounds like you're carrying a heavy load right now. When we're overwhelmed, even small tasks can feel impossible. Let's break things down - what's one small thing that's contributing to this feeling? Sometimes addressing just one piece can help us feel more in control."
    }

    if (lowerMessage.includes("i'm scared") || lowerMessage.includes("i am afraid") || lowerMessage.includes("fear")) {
      return "Fear is such a powerful emotion. Thank you for being brave enough to share that with me. Can you tell me more about what's frightening you? Sometimes putting our fears into words can help us process them better."
    }

    if (lowerMessage.includes("i need advice") || lowerMessage.includes("what should i do")) {
      return "I appreciate you asking for guidance. To offer the most helpful perspective, could you share a bit more about the specific situation you're facing? The more I understand, the better I can support you."
    }

    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      const greetings = [
        "Hello! It's great to hear from you. How are you feeling today?",
        "Hi there! I'm here to support you. What's on your mind?",
        "Hey! Thanks for reaching out. How can I help you today?",
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    // Direct response to the exact message
    if (lowerMessage.includes("how are you") || lowerMessage.includes("how do you feel")) {
      return "Thank you for asking! As an AI, I don't have feelings, but I'm here and ready to support you. How are you doing today?"
    }

    // Emotional support responses - more direct and specific
    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("depressed") ||
      lowerMessage.includes("down") ||
      lowerMessage.includes("upset")
    ) {
      return "I'm sorry to hear you're feeling down. Sadness can be really difficult to navigate. Would you like to talk about what's causing these feelings? Sometimes sharing can help lighten the emotional load."
    }

    if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worried") ||
      lowerMessage.includes("stress") ||
      lowerMessage.includes("panic")
    ) {
      return "Anxiety can be really overwhelming. Let's try a quick grounding exercise: take a deep breath in for 4 counts, hold for 4, and exhale for 6. What's been causing you to feel anxious? I'm here to listen."
    }

    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great") ||
      lowerMessage.includes("excited") ||
      lowerMessage.includes("joy")
    ) {
      return "That's wonderful to hear! I'm so glad you're feeling good. What's been bringing you joy today? It's important to recognize and celebrate these positive moments."
    }

    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("frustrated") ||
      lowerMessage.includes("mad") ||
      lowerMessage.includes("furious")
    ) {
      return "I can understand feeling frustrated. Anger is often a signal that something important to us has been violated or needs attention. What's been triggering these feelings for you?"
    }

    if (
      lowerMessage.includes("tired") ||
      lowerMessage.includes("exhausted") ||
      lowerMessage.includes("sleep") ||
      lowerMessage.includes("fatigue")
    ) {
      return "Being tired affects everything - our mood, thinking, and coping abilities. Have you been able to get enough rest lately? Sometimes small changes to our sleep routine can make a big difference."
    }

    if (lowerMessage.includes("lonely") || lowerMessage.includes("alone") || lowerMessage.includes("isolated")) {
      return "Loneliness can be really painful. Even though I'm an AI, I want you to know that your feelings matter and you deserve connection. What kind of social connection are you missing most right now?"
    }

    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      return "You're very welcome! I'm glad I could be here for you. How are you feeling now?"
    }

    // Catch-all for questions
    if (lowerMessage.includes("?")) {
      return "That's a thoughtful question. I'd like to understand more about what you're asking. Could you share what prompted this question or what you're hoping to learn?"
    }

    // Default response that directly addresses the user's message
    return `Thank you for sharing that with me. I'm here to listen and support you. Would you like to tell me more about how this is affecting you?`
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
      1500 + Math.random() * 2000,
    ) // 1.5-3.5 second delay
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
