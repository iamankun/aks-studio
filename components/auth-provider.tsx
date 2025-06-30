// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

// Demo user constant - tránh tạo object mới mỗi lần
const DEMO_USER: User = {
  id: "demo-admin",
  username: "ankunstudio",
  password: "admin",
  email: "ankunstudio@ankun.dev",
  role: "Label Manager",
  fullName: "An Kun Studio Digital Music Distribution",
  createdAt: "2024-01-01T00:00:00.000Z", // Fixed date để tránh re-render
  avatar: "/face.png",
  bio: "Digital Music Distribution Platform",
  isrcCodePrefix: "VNA2P"
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }

        // Không cần delay, sử dụng requestAnimationFrame để smoother
        await new Promise(resolve => requestAnimationFrame(resolve))

        const stored = localStorage.getItem("aks_user")
        if (stored) {
          try {
            const userData = JSON.parse(stored)
            setUser(userData)
          } catch (parseError) {
            console.error("Failed to parse stored user data:", parseError)
            localStorage.removeItem("aks_user")
            // Fallback to demo user
            setUser(DEMO_USER)
            localStorage.setItem("aks_user", JSON.stringify(DEMO_USER))
          }
        } else {
          // Auto login demo user
          setUser(DEMO_USER)
          localStorage.setItem("aks_user", JSON.stringify(DEMO_USER))
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // Always fallback to demo user
        setUser(DEMO_USER)
        if (typeof window !== 'undefined') {
          localStorage.setItem("aks_user", JSON.stringify(DEMO_USER))
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, []) // Empty dependency - chỉ chạy 1 lần
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      // Simple demo authentication - sử dụng DEMO_USER constant
      if (username === "ankunstudio" && password === "admin") {
        setUser(DEMO_USER)

        if (typeof window !== 'undefined') {
          localStorage.setItem("aks_user", JSON.stringify(DEMO_USER))
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    try {
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("aks_user")
        localStorage.removeItem("demo_submissions")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [])

  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loading
  }), [user, login, logout, loading])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
