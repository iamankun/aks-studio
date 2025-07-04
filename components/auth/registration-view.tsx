"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react"
import { DynamicBackground } from "@/components/dynamic-background"
import Image from "next/image"
import { AwesomeIcon } from "@/components/ui/awesome-icon"

interface RegistrationViewProps {
  onSwitchToLogin: () => void
}

export function RegistrationView({ onSwitchToLogin }: Readonly<RegistrationViewProps>) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [appSettings, setAppSettings] = useState({
    appName: "AKs Studio",
    logoUrl: "/face.png",
  })
  const [currentGreeting, setCurrentGreeting] = useState("Chào mừng")
  const [greetingIndex, setGreetingIndex] = useState(0)

  // Greetings in different languages
  const greetings = React.useMemo(
    () => [
      "Chào mừng",
      "Welcome",
      "Bienvenue",
      "ようこそ",
      "Bienvenido",
      "Willkommen",
      "Benvenuto",
      "स्वागत",
      "Добро пожаловать",
      "환영합니다",
    ],
    []
  )

  // Load app settings
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
  }, [])

  // Cycle through greetings
  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetings.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [greetings.length])

  // Update greeting with fade effect
  useEffect(() => {
    const greetingEl = document.querySelector(".greeting-text")
    if (greetingEl) {
      greetingEl.classList.add("opacity-0")
      setTimeout(() => {
        setCurrentGreeting(greetings[greetingIndex])
        greetingEl.classList.remove("opacity-0")
      }, 200)
    } else {
      setCurrentGreeting(greetings[greetingIndex])
    }
  }, [greetingIndex, greetings])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return false
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)

    try {
      console.log("🔍 Registration attempt:", {
        username: formData.username,
        email: formData.email,
        full_name: formData.fullName,
      })

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName || formData.username,
        }),
      })

      const data = await response.json()
      console.log("🔍 Registration response:", data)

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onSwitchToLogin()
        }, 2000)
      } else {
        setError(data.message ?? "Đã xảy ra lỗi khi đăng ký")
      }
    } catch (error) {
      console.error("🚨 Registration error:", error)
      setError("Đã xảy ra lỗi kết nối")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Dynamic Background System */}
        <DynamicBackground />

        <Card className="w-full max-w-md mx-4 relative z-10 bg-white/85 backdrop-blur-md border border-white/20 shadow-xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                Đăng ký thành công!
              </h2>
              <p className="text-gray-600">
                Tài khoản của bạn đã được tạo thành công. Đang chuyển hướng đến trang đăng nhập...
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl floating"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl floating"></div>
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-cyan-400/40 to-teal-400/40 rounded-full blur-md floating"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Dynamic Background System */}
      <DynamicBackground />

      {/* Registration Form */}
      <Card className="w-full max-w-md mx-4 relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white/50">
              <Image
                src={appSettings.logoUrl}
                alt={`${appSettings.appName} Logo`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/face.png"
                }}
              />
            </div>
          </div>
          <div className="mb-2 text-center">
            <p className="text-lg text-gray-600 greeting-fade">
              <span className="greeting-text transition-all duration-300">{currentGreeting}</span>
            </p>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-center">Tạo tài khoản mới để sử dụng hệ thống</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center">
                <AwesomeIcon icon="fa-solid fa-user" className="mr-2 text-blue-500" />
                Tên đăng nhập *
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="backdrop-blur-sm bg-white/80 border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <AwesomeIcon icon="fa-solid fa-envelope" className="mr-2 text-purple-500" />
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="backdrop-blur-sm bg-white/80 border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center">
                <AwesomeIcon icon="fa-solid fa-id-card" className="mr-2 text-indigo-500" />
                Họ và tên
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nhập họ và tên (tùy chọn)"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={isLoading}
                className="backdrop-blur-sm bg-white/80 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <AwesomeIcon icon="fa-solid fa-lock" className="mr-2 text-cyan-500" />
                Mật khẩu *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="backdrop-blur-sm bg-white/80 border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-cyan-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center">
                <AwesomeIcon icon="fa-solid fa-lock-open" className="mr-2 text-teal-500" />
                Xác nhận mật khẩu *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="backdrop-blur-sm bg-white/80 border-teal-200 focus:border-teal-400 focus:ring-teal-400 transition-all"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-teal-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium hover:shadow-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                  <>
                    <AwesomeIcon icon="fa-solid fa-user-plus" className="mr-2" />
                    Đăng ký
                  </>
              )}
            </Button>

            <div className="text-sm text-center">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
                disabled={isLoading}
              >
                Đăng nhập ngay
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
