"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  username: string
  email?: string
  role: string
  full_name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: any) => Promise<boolean>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const timeoutId = setTimeout(() => {
          console.log("Session check timeout, proceeding without user")
          setLoading(false)
        }, 3000) // 3 second timeout

        const savedUser = localStorage.getItem("aks_user")
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser && parsedUser.role && parsedUser.username) {
            setUser(parsedUser)
          } else {
            localStorage.removeItem("aks_user")
          }
        }

        clearTimeout(timeoutId)
        setLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        localStorage.removeItem("aks_user")
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const clearError = () => setError(null)

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.user && data.user.role) {
        const validatedUser = {
          id: data.user.id || "unknown",
          username: data.user.username || username,
          email: data.user.email || "",
          role: data.user.role || "Artist",
          full_name: data.user.full_name || data.user.username,
          ...data.user,
        }

        setUser(validatedUser)
        localStorage.setItem("aks_user", JSON.stringify(validatedUser))
        return true
      } else {
        setError(data.message || "Login failed")
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error.name === "AbortError") {
        setError("Login timeout. Please try again.")
      } else {
        setError("Network error. Please check your connection.")
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setError(null)
    localStorage.removeItem("aks_user")
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.message || "Registration failed")
      }

      return data.success
    } catch (error) {
      console.error("Registration error:", error)
      if (error.name === "AbortError") {
        setError("Registration timeout. Please try again.")
      } else {
        setError("Network error. Please check your connection.")
      }
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, clearError }}>
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
