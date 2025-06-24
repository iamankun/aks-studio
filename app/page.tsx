"use client"

import { useState, useEffect } from "react"
import { AuthFlowClient } from "@/components/auth-flow-client"
import { MainAppView } from "@/components/main-app-view"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra localStorage cho session
    try {
      const savedUser = localStorage.getItem("aks_user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (username: string, password: string) => {
    try {
      setLoading(true)

      // Fallback authentication - chỉ 1 tài khoản
      if (username === "ankunstudio" && password === "admin") {
        const userData = {
          id: "1",
          username: "ankunstudio",
          role: "Label Manager",
          full_name: "An Kun Studio Digital Music Distribution",
          email: "admin@ankun.dev",
          avatar_url: "/face.png",
          bio: "Digital Music Distribution Platform",
          social_links: {
            facebook: "",
            youtube: "",
            spotify: "",
            appleMusic: "",
            tiktok: "",
            instagram: "",
          },
          created_at: new Date().toISOString(),
          background_settings: {
            type: "video",
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            video_url: "",
            opacity: 0.3,
            playlist: "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
          },
        }

        localStorage.setItem("aks_user", JSON.stringify(userData))
        setUser(userData)
        return { success: true }
      } else {
        return { success: false, message: "Invalid credentials" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("aks_user")
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthFlowClient onLogin={handleLogin} />
  }

  return <MainAppView user={user} onLogout={handleLogout} />
}
