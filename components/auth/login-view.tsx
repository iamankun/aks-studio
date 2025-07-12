"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, User, Lock } from "lucide-react"
import Image from "next/image"
import { logLogin, logUIInteraction } from "@/lib/client-activity-log"

import "@/components/awesome/css/all.min.css"

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  onSwitchToRegister: () => void
  onSwitchToForgot: () => void
}

export function LoginView({ onLogin, onSwitchToRegister, onSwitchToForgot }: Readonly<LoginViewProps>) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentGreeting, setCurrentGreeting] = useState("Xin chào")
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [userRole, setUserRole] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [appSettings] = useState({
    appName: userRole ?? "An Kun Studio",
    logoUrl: "/face.png",
    logoAlt: "Face AK"
  })

  // Greetings in different languages - wrapped in useMemo
  const greetings = useMemo(() => [
    "Xin chào", "こんにちは", "Hola", "Bonjour", "Hello", "Hajimemashite",
    "Guten Tag", "Ciao", "Namaste", "Zdravstvuyte", "안녕하세요", "你好", "مرحبا", "Salam"
  ], [])

  // User recognition based on ID pattern
  const recognizeUser = useCallback((username: string) => {
    if (username.length >= 3) {
      const pattern = username.substring(0, 3).toLowerCase()
      if (pattern === "ank" || pattern === "kun") return "An Kun"
      if (pattern === "adm") return "Người quản lý";
      if (pattern === "ngh" || pattern === "art") return "Nghệ sĩ";
      return "Nghệ sĩ mới"
    }
    return ""
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields first and check the result directly
    const isUsernameValid = validateUsername(username)
    const isPasswordValid = validatePassword(password)

    if (!isUsernameValid || !isPasswordValid) {
      setError("Vui lòng sửa các lỗi được hiển thị.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Log login attempt
      logUIInteraction('form', 'login-form', {
        username: username,
        attempt: 'started'
      });

      const result = await onLogin(username, password)
      console.log("[Copilot Debug] API login result:", result)

      // Log login result
      if (!result.success) {
        setError(result.message ?? "Đăng nhập thất bại")

        // Log failed login
        logLogin('password', 'failed', {
          username: username,
          error: result.message || 'Unknown error'
        });
      } else {
        // Log successful login
        logLogin('password', 'success', {
          username: username,
          role: userRole || 'user'
        });
      }
    } catch (err) {
      console.error("[Copilot Debug] Login error:", err)
      setError("Đã xảy ra lỗi không mong muốn")

      // Log error during login
      logLogin('password', 'error', {
        username: username,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setLoading(false)
    }
  }

  // Update greeting periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [greetings.length])

  // Update greeting with fade effect
  useEffect(() => {
    const greetingEl = document.querySelector('.greeting-text')
    if (greetingEl) {
      greetingEl.classList.add('opacity-0')
      setTimeout(() => {
        setCurrentGreeting(greetings[greetingIndex])
        greetingEl.classList.remove('opacity-0')
      }, 200)
    } else {
      setCurrentGreeting(greetings[greetingIndex])
    }
  }, [greetingIndex, greetings])

  // Update user role when username changes
  useEffect(() => {
    const role = recognizeUser(username)
    setUserRole(role)
  }, [username, recognizeUser])

  const validateUsername = (value: string): boolean => {
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return false
    } else if (value.length > 20) {
      setUsernameError("Username must be less than 20 characters")
      return false
    } else {
      setUsernameError("")
      return true
    }
  }

  const validatePassword = (value: string): boolean => {
    if (value.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    } else {
      setPasswordError("")
      return true
    }
  }

  const inputTransitionClasses = "transition-all duration-300 bg-transparent border-gray-600 hover:border-gray-400 focus:border-primary focus:ring-primary/20"
  const buttonTransitionClasses = "transition-all duration-500 bg-gradient-to-r from-primary via-purple-600 to-primary hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
  const linkTransitionClasses = "transition-colors duration-300 text-gray-400 hover:text-primary hover:underline underline-offset-4"

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 pt-24 relative overflow-hidden">

      <Card className="w-full max-w-md relative z-40 border border-white/10 shadow-2xl
        bg-background/5 backdrop-blur-2xl hover:bg-background/10 transition-all duration-500
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-white/0 before:rounded-xl">
        <CardHeader className="text-center relative z-10">
          <div className="relative w-20 h-20 mx-auto mb-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full blur-lg"></div>
            <Image
              src={appSettings.logoUrl}
              alt={appSettings.logoAlt}
              fill
              className="object-cover rounded-full p-1 bg-background/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
              priority
            />
          </div>
          <p className="text-muted-foreground text-sm animate-fade-in">
            {userRole || "Welcome back to AKs Studio"}
          </p>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent 
            bg-gradient-to-r from-indigo-500 to-pink-500 select-none">
            {currentGreeting}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 group/username">
              <Label htmlFor="username" className="text-sm font-medium inline-block transition-transform duration-300 group-focus-within/username:translate-x-2">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    validateUsername(e.target.value);
                  }}
                  className={`pl-10 bg-background/30 border-white/10 focus:border-primary/50
                    placeholder:text-muted-foreground/50 ${inputTransitionClasses}
                    focus:bg-background/40 focus:ring-2 focus:ring-offset-0
                    ${usernameError ? 'border-destructive/50 focus:border-destructive' : ''}`}
                  placeholder="Enter your username"
                  aria-invalid={!!usernameError}
                  aria-describedby={usernameError ? "username-error" : undefined}
                  disabled={loading}
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50 transition-transform duration-300 group-focus-within/username:scale-110 group-focus-within/username:text-primary/70" />
                {/* <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover/username:opacity-100 group-focus-within/username:opacity-100 transition-opacity duration-500 pointer-events-none"></div> */}
              </div>
              {usernameError && (
                <div id="username-error" className="text-xs text-destructive mt-1 ml-1 animate-fade-in flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {usernameError}
                </div>
              )}
            </div>

            <div className="space-y-2 group/password">
              <Label htmlFor="password" className="text-sm font-medium inline-block transition-transform duration-300 group-focus-within/password:translate-x-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  className={`pl-10 bg-background/30 border-white/10 focus:border-primary/50
                    placeholder:text-muted-foreground/50 ${inputTransitionClasses}
                    focus:bg-background/40 focus:ring-2 focus:ring-offset-0
                    ${passwordError ? 'border-destructive/50 focus:border-destructive' : ''}`}
                  placeholder="Enter your password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/50 transition-transform duration-300 group-focus-within/password:scale-110 group-focus-within/password:text-primary/70" />
                {/* <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover/password:opacity-100 group-focus-within/password:opacity-100 transition-opacity duration-500 pointer-events-none"></div> */}
              </div>
              {passwordError && (
                <div id="password-error" className="text-xs text-destructive mt-1 ml-1 animate-fade-in flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {passwordError}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                <span className="flex-1">{error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-destructive/70 hover:text-destructive transition-colors"
                  aria-label="Dismiss error"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full relative overflow-hidden group login-button ${buttonTransitionClasses}`}
              disabled={loading}
              variant="default"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                  <>
                    <span className="relative z-10">Login</span>
                    {/* <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0
                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" /> */}
                  </>
              )}
            </Button>

            <div className="flex flex-col space-y-2 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  logUIInteraction('button', 'forgot-password', {
                    source: 'login-view'
                  });
                  onSwitchToForgot();
                }}
                className={linkTransitionClasses}
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => {
                  logUIInteraction('button', 'switch-to-register', {
                    source: 'login-view'
                  });
                  onSwitchToRegister();
                }}
                className={linkTransitionClasses}
              >
                Don&apos;t have an account? Register
              </button>
            </div>
          </form>
        </CardContent>
      </Card >
    </div>
  )
}