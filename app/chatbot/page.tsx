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

  // Enhanced AI-like response system with context awareness
  const generateIntelligentResponse = (userMessage: string, conversationHistory: Message[]): string => {
    const lowerMessage = userMessage.toLowerCase()
    const recentMessages = conversationHistory.slice(-6) // Last 6 messages for context

    // Crisis intervention - highest priority
    if (
      lowerMessage.includes("suicide") ||
      lowerMessage.includes("kill myself") ||
      lowerMessage.includes("end it all") ||
      lowerMessage.includes("don't want to live")
    ) {
      return "I'm really concerned about what you're sharing with me. Your life has value and meaning. Please reach out for immediate help: Call or text 988 for the Suicide & Crisis Lifeline, or text HOME to 741741 for the Crisis Text Line. These services have trained counselors available 24/7. You don't have to go through this alone."
    }

    if (
      lowerMessage.includes("self harm") ||
      lowerMessage.includes("hurt myself") ||
      lowerMessage.includes("cutting")
    ) {
      return "I'm worried about you and want you to be safe. Self-harm might feel like relief in the moment, but there are healthier ways to cope with difficult emotions. Please consider reaching out to the Crisis Text Line (text HOME to 741741) or calling 988. Would you like to talk about what's driving these feelings?"
    }

    // Emotional state recognition and personalized responses
    if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("anxiety") ||
      lowerMessage.includes("panic") ||
      lowerMessage.includes("worried")
    ) {
      const anxietyResponses = [
        "Anxiety can feel overwhelming, but you're not alone in this. Let's try a grounding technique: name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. What's been triggering your anxiety lately?",
        "I hear that you're feeling anxious. That's a really difficult emotion to sit with. Try this breathing exercise with me: breathe in slowly for 4 counts, hold for 4, then exhale for 6. What specific thoughts or situations are making you feel this way?",
        "Anxiety is your mind's way of trying to protect you, even when there's no real danger. Let's work through this together. Can you tell me what's been on your mind that's causing these anxious feelings?",
      ]
      return anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)]
    }

    if (
      lowerMessage.includes("depressed") ||
      lowerMessage.includes("depression") ||
      lowerMessage.includes("sad") ||
      lowerMessage.includes("hopeless") ||
      lowerMessage.includes("empty")
    ) {
      const depressionResponses = [
        "I'm sorry you're going through such a difficult time. Depression can make everything feel heavy and meaningless, but these feelings, while very real, are temporary. You've reached out today, which shows incredible strength. What's been the hardest part for you lately?",
        "Thank you for trusting me with how you're feeling. Depression can be isolating, but you're not alone. Even small steps matter - like talking to me right now. Have you been able to do anything today that brought you even a tiny bit of comfort?",
        "I hear the pain in your words, and I want you to know that what you're experiencing is valid. Depression lies to us about our worth and our future. You matter, and there is hope, even when it's hard to see. What's one thing that used to bring you joy?",
      ]
      return depressionResponses[Math.floor(Math.random() * depressionResponses.length)]
    }

    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("frustrated") ||
      lowerMessage.includes("mad") ||
      lowerMessage.includes("furious") ||
      lowerMessage.includes("rage")
    ) {
      return "Anger is often a signal that something important to you has been threatened or violated. It's a valid emotion, and it's okay to feel this way. Let's explore what's underneath this anger - sometimes it's hurt, fear, or feeling unheard. What happened that triggered these feelings?"
    }

    if (
      lowerMessage.includes("lonely") ||
      lowerMessage.includes("alone") ||
      lowerMessage.includes("isolated") ||
      lowerMessage.includes("no friends")
    ) {
      return "Loneliness is one of the most painful human experiences, and I'm glad you're sharing this with me. Even though I'm an AI, I want you to know that your feelings matter and you deserve connection. What kind of connection are you missing most? Sometimes even small interactions can help bridge that gap."
    }

    if (
      lowerMessage.includes("overwhelmed") ||
      lowerMessage.includes("too much") ||
      lowerMessage.includes("can't cope") ||
      lowerMessage.includes("breaking down")
    ) {
      return "Feeling overwhelmed is like being caught in a storm - everything feels chaotic and too much at once. Let's break this down into smaller pieces. What's the one thing that's weighing on you most heavily right now? Sometimes addressing just one piece can help us feel more in control."
    }

    if (lowerMessage.includes("stressed") || lowerMessage.includes("pressure") || lowerMessage.includes("burnout")) {
      return "Stress can be exhausting, both mentally and physically. Your body and mind are telling you they need care. What's been the biggest source of pressure for you? Let's think about one small way you could give yourself some relief today."
    }

    // Positive emotions - validate and explore
    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great") ||
      lowerMessage.includes("excited") ||
      lowerMessage.includes("joy")
    ) {
      return "It's wonderful to hear that you're feeling good! These positive moments are so important to acknowledge and celebrate. What's been bringing you this happiness? I'd love to hear more about what's going well for you."
    }

    if (lowerMessage.includes("grateful") || lowerMessage.includes("thankful") || lowerMessage.includes("blessed")) {
      return "Gratitude is such a powerful emotion and practice. It's beautiful that you're recognizing the good in your life. What are you feeling most grateful for right now? Sometimes focusing on these positive aspects can help us through difficult times."
    }

    // Questions about the AI
    if (lowerMessage.includes("who are you") || lowerMessage.includes("what are you")) {
      return "I'm your AI wellness companion, designed to provide emotional support and be a safe space for you to express your feelings. While I'm not human, I'm here to listen without judgment and offer support. I care about your wellbeing. How can I best support you today?"
    }

    if (lowerMessage.includes("can you help") || lowerMessage.includes("what can you do")) {
      return "I'm here to listen, provide emotional support, and offer coping strategies. I can help you process difficult emotions, suggest breathing exercises, provide a judgment-free space to express yourself, and remind you that you're not alone. What kind of support would be most helpful for you right now?"
    }

    // Greetings and check-ins
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      const greetings = [
        "Hello! I'm really glad you're here. How are you feeling today?",
        "Hi there! Thank you for reaching out. What's on your mind?",
        "Hey! It's good to connect with you. How can I support you today?",
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    if (lowerMessage.includes("how are you")) {
      return "Thank you for asking! As an AI, I don't have feelings, but I'm here and fully present for you. More importantly, how are you doing? I'm here to listen."
    }

    // Sleep and fatigue
    if (
      lowerMessage.includes("tired") ||
      lowerMessage.includes("exhausted") ||
      lowerMessage.includes("can't sleep") ||
      lowerMessage.includes("insomnia")
    ) {
      return "Being tired affects everything - our emotions, our thinking, our ability to cope. Sleep is so important for mental health. Have you been having trouble sleeping, or are you just feeling emotionally drained? Let's talk about what might help you get the rest you need."
    }

    // Relationship issues
    if (
      lowerMessage.includes("relationship") ||
      lowerMessage.includes("boyfriend") ||
      lowerMessage.includes("girlfriend") ||
      lowerMessage.includes("partner") ||
      lowerMessage.includes("family")
    ) {
      return "Relationships can be both our greatest source of joy and our deepest source of pain. It sounds like you're going through something difficult with someone important to you. Would you like to share what's been happening? Sometimes talking through relationship challenges can help us see them more clearly."
    }

    // Work/school stress
    if (
      lowerMessage.includes("work") ||
      lowerMessage.includes("job") ||
      lowerMessage.includes("school") ||
      lowerMessage.includes("college") ||
      lowerMessage.includes("boss")
    ) {
      return "Work and school pressures can be really overwhelming. It's hard when the places we spend most of our time become sources of stress. What's been the most challenging part of your work/school situation? Let's think about some ways to manage this stress."
    }

    // Gratitude and thanks
    if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("appreciate")) {
      return "You're so welcome! I'm honored that you've shared your feelings with me. How are you feeling right now compared to when we started talking? Remember, I'm always here when you need someone to listen."
    }

    // Questions
    if (lowerMessage.includes("?")) {
      return "That's a really thoughtful question. I'd like to understand more about what you're asking and what's behind it. Can you tell me more about what prompted this question or what you're hoping to explore?"
    }

    // Default empathetic response with context awareness
    const contextualResponses = [
      "Thank you for sharing that with me. I can hear that this is important to you. Can you tell me more about how this is affecting you?",
      "I'm here to listen and support you through whatever you're experiencing. What would be most helpful for you to talk about right now?",
      "It sounds like you have a lot on your mind. I'm here to listen without judgment. What's been weighing on you most heavily?",
      "I appreciate you opening up to me. Your feelings and experiences matter. What's been the most difficult part of what you're going through?",
      "Thank you for trusting me with your thoughts. I'm here to support you. How has this been impacting your daily life?",
    ]

    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)]
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
    const currentInput = inputMessage
    setInputMessage("")
    setIsTyping(true)

    // Simulate realistic AI response time
    setTimeout(
      () => {
        const aiResponse = generateIntelligentResponse(currentInput, messages)

        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: "bot",
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, botResponse])
        storage.addChatMessage(botResponse)
        setIsTyping(false)
      },
      1500 + Math.random() * 2000,
    ) // 1.5-3.5 second realistic delay
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
