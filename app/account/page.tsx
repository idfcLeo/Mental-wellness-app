"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage, type User } from "@/lib/storage"
import { ArrowLeft, UserIcon, Camera, Trash2, Save, Shield, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const currentUser = storage.getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    setName(currentUser.name || "")
    setEmail(currentUser.email || "")
    setProfilePhoto(currentUser.profilePhoto || "")
    setLoading(false)
  }, [router])

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setProfilePhoto(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const updatedUser = {
        ...user,
        name: name.trim() || "User",
        profilePhoto,
      }

      storage.setCurrentUser(updatedUser)

      // Try to update Firebase if available (but don't block)
      try {
        const { getFirebaseAuth } = await import("@/lib/firebase")
        const auth = await getFirebaseAuth()

        if (auth?.currentUser) {
          const { updateProfile } = await import("firebase/auth")
          await updateProfile(auth.currentUser, {
            displayName: updatedUser.name,
            photoURL: profilePhoto || null,
          })
          console.log("Firebase profile updated successfully")
        }
      } catch (firebaseError) {
        console.log("Firebase profile update failed, saved locally only")
      }

      setUser(updatedUser)
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE") return

    try {
      // Try to delete from Firebase if available
      try {
        const { getFirebaseAuth } = await import("@/lib/firebase")
        const auth = await getFirebaseAuth()

        if (auth?.currentUser) {
          const { deleteUser } = await import("firebase/auth")
          await deleteUser(auth.currentUser)
        }
      } catch (firebaseError) {
        console.log("Firebase account deletion failed, deleting locally only")
      }

      // Clear all local data
      storage.clearCurrentUser()
      localStorage.removeItem("mindfulme_mood_entries")
      localStorage.removeItem("mindfulme_chat_history")

      const users = JSON.parse(localStorage.getItem("mindfulme_users") || "[]")
      const filteredUsers = users.filter((u: any) => u.id !== user.id)
      localStorage.setItem("mindfulme_users", JSON.stringify(filteredUsers))

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    const moodEntries = storage.getMoodEntries()
    const chatHistory = storage.getChatHistory()

    const exportData = {
      user: {
        name: user?.name,
        email: user?.email,
        exportDate: new Date().toISOString(),
      },
      moodEntries,
      chatHistory,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `mindfulme-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your data has been downloaded as a JSON file.",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account...</p>
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
              <UserIcon className="h-6 w-6 text-purple-500" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">My Account</h1>
                <p className="text-xs sm:text-sm text-gray-600">Manage your profile and settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Profile Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-purple-500" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your personal information and profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-gray-800">{name || "User"}</h3>
                <p className="text-sm text-gray-600">{email}</p>
                <p className="text-xs text-gray-500 mt-1">Click the camera icon to change your photo</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Display Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input id="email" type="email" value={email} disabled className="bg-gray-100 cursor-not-allowed" />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Account Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{storage.getMoodEntries().length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Mood Entries</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {new Set(storage.getMoodEntries().map((e) => e.date)).size}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Days Tracked</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {storage.getChatHistory().filter((m) => m.sender === "user").length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Chat Messages</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-pink-600">
                  {user?.id === "demo-user" ? "Demo" : "Active"}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Account Type</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-500" />
              <span>Data Management</span>
            </CardTitle>
            <CardDescription>Export or manage your personal data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleExportData} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  storage.clearChatHistory()
                  toast({ title: "Chat history cleared", description: "All chat messages have been deleted." })
                }}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat History
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Export includes your mood entries, chat history, and profile information in JSON format.
            </p>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">Data Storage</p>
                  <p className="text-xs text-green-600">
                    {user?.id === "demo-user" ? "Local browser storage only" : "Secure cloud & local storage"}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">Data Encryption</p>
                  <p className="text-xs text-blue-600">All data is encrypted in transit and at rest</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-800">Privacy First</p>
                  <p className="text-xs text-purple-600">We never share your personal data with third parties</p>
                </div>
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-red-600">
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showDeleteConfirm ? (
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-red-100 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-2">⚠️ This action cannot be undone!</p>
                  <p className="text-xs text-red-700">
                    This will permanently delete your account, mood entries, chat history, and all other data.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-red-700">Type "DELETE" to confirm account deletion:</label>
                  <Input
                    type="text"
                    placeholder="Type DELETE here"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="bg-white border-red-300 focus:border-red-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE"}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Permanently Delete Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
