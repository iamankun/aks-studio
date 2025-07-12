// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react"
import type { User } from "@/types/user"
import { AuthFlowClient } from "@/components/auth-flow-client"

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
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)

        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('currentUser')

        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            setUser(userData)
          } catch (error) {
            console.error('❌ AuthProvider: Error parsing stored user:', error)
            localStorage.removeItem('currentUser')
            setShowLogin(true)
          }
        } else {
          // Nếu không có user, hiển thị login view
          setShowLogin(true)
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error checking auth:', error)
        setShowLogin(true)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log('DEBUG [AuthProvider]: API Response Data:', data);

      if (response.ok && data.data) {
        setUser(data.data)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        setShowLogin(false)
        return true
      }

      return false
    } catch (error) {
      console.error('❌ AuthProvider: Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('currentUser')
    setShowLogin(true)
  }, [])

  // Cung cấp context cho toàn bộ ứng dụng
  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
  }), [user, login, logout, loading])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Đang xác thực...</div>
          <div className="text-white/70 text-sm mt-2">AKs Studio Digital Music</div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {!user && (showLogin || showRegister) ? (
        <AuthFlowClient
          onLoginSuccess={(userData) => {
            setUser(userData)
            setShowLogin(false)
            setShowRegister(false)
          }}
          onLoginCancel={() => setShowLogin(false)}
          onRegisterSuccess={(userData) => {
            setUser(userData)
            setShowRegister(false)
          }}
          onRegisterCancel={() => setShowRegister(false)}
          showLogin={showLogin}
          showRegister={showRegister}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}
          onSwitchToLogin={() => {
            setShowRegister(false)
            setShowLogin(true)
          }}
        />
      ) : children}
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
