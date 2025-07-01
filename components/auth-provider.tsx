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
  readonly children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        console.log("🔍 AuthProvider: Checking authentication")

        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('currentUser')
        console.log("🔍 AuthProvider: Stored user data:", storedUser ? "Found" : "Not found")

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            console.log('✅ AuthProvider: Restored user from localStorage:', userData)
            setUser(userData)
          } catch (error) {
            console.error('❌ AuthProvider: Error parsing stored user:', error)
            localStorage.removeItem('currentUser')
            console.log("🧹 AuthProvider: Cleared corrupted localStorage")
          }
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error checking auth:', error)
      } finally {
        console.log("🔍 AuthProvider: Authentication check completed, setting loading=false")
        setLoading(false)
      }
    }

    checkAuth()
  }, [])
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      console.log('Attempting login for:', username)

      // Call real login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      console.log('Login response status:', response.status)

      if (!response.ok) {
        console.log('Login failed: response not ok')
        return false
      }

      const result = await response.json()
      console.log('Login response data:', result)

      if (result.success && result.user) {
        // Map the API response to our User type
        const userFromAPI: User = {
          id: result.user.id,
          username: result.user.username,
          password: "", // Don't store password
          email: result.user.email,
          role: result.user.role,
          fullName: result.user.fullName,
          createdAt: result.user.createdAt ?? new Date().toISOString(),
          avatar: result.user.avatar ?? "/face.png",
          bio: result.user.bio ?? "Digital Music Distribution Platform",
          isrcCodePrefix: result.user.isrcCodePrefix ?? "VNA2P"
        }

        console.log('Setting user:', userFromAPI)
        setUser(userFromAPI)

        if (typeof window !== 'undefined') {
          localStorage.setItem("currentUser", JSON.stringify(userFromAPI))
        }

        return true
      }

      console.log('Login failed: invalid response structure')
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
        localStorage.removeItem("currentUser")
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
