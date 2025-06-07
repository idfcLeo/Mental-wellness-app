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

    // Greeting responses
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      const greetings = [
        "Hello! It's great to hear from you. How are you feeling today?",
        "Hi there! I'm here to support you. What's on your mind?",
        "Hey! Thanks for reaching out. How can I help you today?",
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    // How are you responses
    if (lowerMessage.includes("how are you") || lowerMessage.includes("how do you feel")) {
      return "Thank you for asking! As an AI, I don't have feelings, but I'm here and ready to support you. How are you doing today?"
    }

    // Emotional support responses
    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("depressed") ||
      lowerMessage.includes("down") ||
      lowerMessage.includes("upset")
    ) {
      const responses = [
        "I hear that you're feeling sad, and I want you to know that your feelings are completely valid. It takes courage to share this. What's been weighing on your heart lately?",
        "I'm sorry you're going through a difficult time. Sadness is a natural human emotion, and it's okay to feel this way. Would you like to talk about what's contributing to these feelings?",
        "Thank you for trusting me with how you're feeling. When we're sad, it can feel overwhelming. Have you been able to do any small things that usually bring you comfort?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("worried") ||
      lowerMessage.includes("stress") ||
      lowerMessage.includes("panic")
    ) {
      const responses = [
        "Anxiety can feel really overwhelming. Let's try to ground ourselves together. Can you tell me 5 things you can see around you right now? This can help bring you back to the present moment.",
        "I understand you're feeling anxious. That's a very common experience. Try taking slow, deep breaths with me - breathe in for 4 counts, hold for 4, then exhale for 4. What's been causing you the most worry lately?",
        "Stress and anxiety are your mind's way of trying to protect you, but they can be exhausting. What's one small thing you could do right now to take care of yourself?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great") ||
      lowerMessage.includes("excited") ||
      lowerMessage.includes("joy")
    ) {
      const responses = [
        "That's wonderful to hear! I'm so glad you're feeling good. What's been bringing you joy today? It's important to celebrate these positive moments.",
        "It makes me happy to know you're doing well! Would you like to share what's contributing to your positive mood? Sometimes talking about good things helps them last longer.",
        "That's fantastic! Your happiness is contagious, even through text. What's been the highlight of your day?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("frustrated") ||
      lowerMessage.includes("mad") ||
      lowerMessage.includes("furious")
    ) {
      const responses = [
        "I can sense your frustration, and anger is a completely valid emotion. It often tells us that something important to us has been affected. What's been triggering these feelings?",
        "It sounds like you're dealing with some intense emotions right now. Anger can be really draining. Would it help to talk through what's making you feel this way?",
        "Feeling angry is natural, and it's okay to experience this emotion. Sometimes anger is our way of protecting ourselves. What situation has been bothering you?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (
      lowerMessage.includes("tired") ||
      lowerMessage.includes("exhausted") ||
      lowerMessage.includes("sleep") ||
      lowerMessage.includes("fatigue")
    ) {
      const responses = [
        "Being tired can affect everything - our mood, our thinking, our ability to cope. Have you been getting enough rest lately? Sometimes our bodies are telling us we need to slow down.",
        "Exhaustion is tough, both physically and emotionally. Are you having trouble sleeping, or have you been pushing yourself too hard? Your rest is important for your wellbeing.",
        "Feeling tired can make everything else feel harder. What's your sleep routine like? Sometimes small changes can make a big difference in how rested we feel.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (lowerMessage.includes("lonely") || lowerMessage.includes("alone") || lowerMessage.includes("isolated")) {
      const responses = [
        "Loneliness can be really painful, and I want you to know that reaching out here shows strength. You're not as alone as you might feel right now. What's been making you feel most isolated?",
        "Feeling lonely is one of the hardest emotions to bear. Thank you for sharing this with me. Even though I'm an AI, I want you to know that your feelings matter and you deserve connection.",
        "I hear that you're feeling alone. That takes courage to admit. Sometimes loneliness comes even when we're around people. What kind of connection are you missing most?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("support") || lowerMessage.includes("crisis")) {
      return "I'm here to support you, and I'm glad you reached out. While I can provide emotional support and coping strategies, please remember that if you're having thoughts of self-harm or are in crisis, it's important to reach out to a mental health professional, crisis hotline, or emergency services immediately. What kind of support are you looking for today?"
    }

    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
      const responses = [
        "You're very welcome! It means a lot to me that I could help, even in a small way. How are you feeling now?",
        "I'm so glad I could be here for you. Thank you for trusting me with your thoughts and feelings.",
        "You don't need to thank me - this is what I'm here for. I'm honored that you shared with me today.",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    // Question responses
    if (
      lowerMessage.includes("what") ||
      lowerMessage.includes("how") ||
      lowerMessage.includes("why") ||
      lowerMessage.includes("?")
    ) {
      const responses = [
        "That's a thoughtful question. What are your own thoughts about this? Sometimes talking through our own ideas can be really helpful.",
        "I appreciate you asking. What's been on your mind about this topic? I'd love to hear your perspective.",
        "That's something worth exploring. What feelings come up for you when you think about this?",
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    // Default supportive responses
    const defaultResponses = [
      "Thank you for sharing that with me. It sounds like there's a lot on your mind. How does it feel to talk about this?",
      "I'm listening and I hear you. Can you tell me more about what you're experiencing right now?",
      "That sounds important to you. What emotions are coming up as you think about this?",
      "I appreciate you opening up. What would be most helpful for you in this moment?",
      "It takes courage to share your thoughts and feelings. What support do you need right now?",
      "I'm here with you. What's the most challenging part of what you're going through?",
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
