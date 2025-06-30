"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, RefreshCw, Moon, Sun } from "lucide-react"
import Image from "next/image"
import { DynamicBackground } from "@/components/dynamic-background"

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
  const [isReloading, setIsReloading] = useState(false)
  const [currentGreeting, setCurrentGreeting] = useState("Xin chào")
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [userRole, setUserRole] = useState("")
  const [binaryText, setBinaryText] = useState("")
  const [companyBinary, setCompanyBinary] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showBinary, setShowBinary] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Light sweep throttling
  const [lastSweepTime, setLastSweepTime] = useState(0)
  const SWEEP_COOLDOWN = 2000 // 2 seconds cooldown

  const [appSettings, setAppSettings] = useState({
    appName: userRole || "AKs Studio",
    logoUrl: "/face.png",
    Avatars: "/wp-content/uploads/face.png"
  })

  // Greetings in different languages
  const greetings = [
    "Xin chào", "こんにちは", "Hola", "Bonjour", "Hello", "Hajimemashite", "Hola",
    "Guten Tag", "Ciao", "Namaste", "Zdravstvuyte", "안녕하세요", "你好", "Olá", "Привет", "שלום", "Merhaba",
    "สวัสดี", "Kamusta", "Selam", "Hej", "Привіт", "Halo", "Szia", "Здраво", "שלום", "Merhaba"
  ]

  // Binary encoding/decoding functions
  const textToBinary = (text: string) => {
    return text.split('').map(char =>
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ')
  }

  // Random binary animation for company name
  const generateRandomBinary = (length: number) => {
    return Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('')
  }

  // User recognition based on ID pattern
  const recognizeUser = (username: string) => {
    if (username.length >= 3) {
      const pattern = username.substring(0, 3).toLowerCase()
      if (pattern === "ank" || pattern === "kun") return "An Kun" // Assuming "ank" or "kun" in username implies An Kun
      if (pattern === "adm") return "Người quản lý"
      if (pattern === "ngh" || pattern === "art") return "Nghệ sĩ"

      return "Nghệ sĩ mới hen"
    }
    return "" // Default return if no pattern matches or username is too short
  }
  // Throttled light sweep function - improved version
  const triggerLightSweep = (isIntense = false) => {
    const now = Date.now();
    if (now - lastSweepTime < SWEEP_COOLDOWN) {
      return; // Skip if still in cooldown
    }

    setLastSweepTime(now);
    const btn = document.querySelector('.login-button');
    if (!btn) return;

    const className = isIntense ? 'light-sweep-intense' : 'light-sweep';

    // Remove any existing classes first
    btn.classList.remove('light-sweep', 'light-sweep-intense');

    // Add new class after a small delay to ensure clean animation
    requestAnimationFrame(() => {
      btn.classList.add(className);
    });

    // Remove class after 2 seconds
    setTimeout(() => {
      btn.classList.remove(className);
    }, 2000);
  }

  // Load app settings for logo and title
  useEffect(() => {
    const savedApp = localStorage.getItem("appSettings_v2")
    if (savedApp) {
      try {
        const parsed = JSON.parse(savedApp)
        setAppSettings(parsed)
      } catch (err) {
        console.error("Failed to load app settings:", err)
      }
    }

    // Detect system theme
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(systemDark)
  }, [])

  // Company binary animation with toggle
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBinary = generateRandomBinary(24)
      setCompanyBinary(randomBinary)
    }, 150)
    return () => clearInterval(interval)
  }, [])

  // Toggle between company name and binary every 4 seconds
  useEffect(() => {
    const toggleInterval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setShowBinary(!showBinary)
        setIsTransitioning(false)
      }, 300) // Transition duration
    }, 4000) // Switch every 4 seconds
    return () => clearInterval(toggleInterval)
  }, [showBinary])

  // Cycle through greetings with smoother transition
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 3000) // Slower for better readability
    return () => clearInterval(interval)
  }, [greetings.length])

  // Update greeting with fade effect
  useEffect(() => {
    // Add fade out effect before changing
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

  // Binary text animation
  useEffect(() => {
    if (username) {
      const role = recognizeUser(username)
      setUserRole(role)
      const binary = textToBinary(username)
      setBinaryText(binary)
    } else {
      setUserRole("")
      setBinaryText("")
    }
  }, [username])

  // Username change detection - không trigger light sweep
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await onLogin(username, password)
      if (!result.success) {
        setError(result.message ?? "Đăng nhập thất bại")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Đã xảy ra lỗi không mong muốn")
    } finally {
      setLoading(false)
    }
  }

  const handleReload = () => {
    setIsReloading(true)
    // Add light sweep effect
    const btn = document.querySelector('.reload-button')
    btn?.classList.add('light-sweep-active')

    setTimeout(() => {
      btn?.classList.remove('light-sweep-active')
      window.location.reload()
    }, 800) // Light sweep duration
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Apply theme to document
    document.documentElement.classList.toggle('dark', !isDarkMode)
  }

  return (
    <div className="login-container min-h-screen w-full flex relative overflow-hidden">
      {/* Dynamic Background */}
      <DynamicBackground />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20 z-1"></div>

      {/* Main Content Columns */}
      <div className="relative z-10 flex flex-1">
        {/* Left Column - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="glass-card">
              <CardHeader className="text-center">
                {/* Logo */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white/50 flex items-center justify-center">
                    <Image
                      src={`${appSettings.logoUrl}Logo`}
                      alt={`${appSettings.appName} || ${appSettings.logoUrl}Logo`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://ankun.dev/wp-content/uploads/2025/06/my-notion-face-transparent.png"
                      }}
                    />
                  </div>
                </div>

                {/* Dynamic Greeting */}
                <div className="mb-4">
                  <p className="text-lg text-gray-600 greeting-fade">
                    <span className="greeting-text transition-all duration-300">{currentGreeting}</span>
                  </p>
                  {userRole && (
                    <p className="text-sm text-indigo-600 font-medium user-role-fade animate-pulse">✨ {userRole}</p>)}
                </div>

                <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{userRole || `${appSettings.appName}`}</span>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Tên đăng nhập</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      placeholder="ankunstudio"
                      required
                      className="transition-all duration-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {/* Binary text display */}
                    {binaryText && (
                      <div className="text-xs text-gray-500 font-mono p-2 bg-gray-50 rounded border overflow-hidden">
                        <div className="binary-animation">{binaryText}</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="admin"
                      required
                    />
                  </div>
                  {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                  <Button
                    type="submit"
                    className="w-full genZ-shimmer transition-all duration-300 hover:scale-105 active:scale-95 login-button"
                    disabled={loading}
                    onMouseEnter={() => triggerLightSweep(false)}
                    onClick={() => triggerLightSweep(true)}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-center space-y">
                  <Button variant="link" onClick={onSwitchToForgot} className="text-sm">
                    Quên mật khẩu?
                  </Button>
                  <div>
                    <Button variant="link" onClick={onSwitchToRegister} className="text-sm">
                      Chưa có tài khoản? Đăng ký ngay
                    </Button>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-sm text-center border border-blue-200/50">
                  <strong className="text-blue-700">Chỉ cần bạn đăng ký tài khoản</strong>
                  <br />
                  <span className="text-blue-600">Là bạn đã đồng ý với hai vấn đề sau:</span>
                  <br />
                  <span className="text-blue-600"><a href="https://ankun.dev/terms-and-conditions" target="_blank" rel="noopener noreferrer">Điều khoản và điều kiện</a><p><a href="https://ankun.dev/privacy-policy" target="_blank" rel="noopener noreferrer">Chính sách và quyền riêng tư</a></p></span>
                </div>
              </CardContent>
            </Card>

            {/* Control Buttons - Bottom */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-300"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReload}
                disabled={isReloading}
                className={`reload-button bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-300 ${isReloading ? 'reload-pulsing' : ''}`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {isReloading ? 'Đang tải...' : 'Reload'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Company Display */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            {/* Company Logo and Name */}
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-2xl border-4 border-white/50">
                  <Image
                    src={appSettings.logoUrl}
                    alt={`${appSettings.Avatars} Logo`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/face.png"
                    }}
                  />
                </div>
              </div>

              {/* Company Name with Binary Animation - Technology Toggle */}
              <div className="space-y-4">
                <div className="relative h-16 flex items-center justify-center">
                  {/* Company Name */}
                  <h1
                    className={`absolute text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-500 ${showBinary ? 'opacity-0 transform scale-95 blur-sm' : 'opacity-100 transform scale-100 blur-0'
                      } ${isTransitioning ? 'tech-glitch' : ''}`}
                  >
                    {appSettings.appName}
                  </h1>

                  {/* Binary Code */}
                  <div
                    className={`absolute font-mono text-xl text-purple-400 transition-all duration-500 ${showBinary ? 'opacity-100 transform scale-100 blur-0' : 'opacity-0 transform scale-105 blur-sm'
                      } ${isTransitioning ? 'tech-glitch' : ''}`}
                  >
                    <div className="binary-animation-company-large">
                      {companyBinary}
                    </div>
                  </div>

                  {/* Technology transition effects */}
                  {isTransitioning && (
                    <div className="absolute inset-0 tech-scan-line"></div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements - GenZ style */}
        <div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl floating"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-xl floating"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-2xl floating"></div>

          {/* Additional GenZ floating elements */}
          <div className="absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-lg blur-lg floating rotate-45"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-green-400/30 to-cyan-400/30 rounded-full blur-lg floating"></div>
          <div className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-pink-400/40 to-purple-400/40 rounded-full blur-md floating"></div>
        </div>
      </div>
    </div>
  )
}