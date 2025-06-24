"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, Music } from "lucide-react"
import { authenticateUser } from "@/lib/auth-service"
import type { User } from "@/types/user"

interface LoginViewProps {
  onLoginSuccess: (user: User) => void
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
}

export default function LoginView({ onLoginSuccess, onSwitchToRegister, onSwitchToForgotPassword }: LoginViewProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await authenticateUser(username, password)

      if (user) {
        console.log("✅ Login successful:", user)
        onLoginSuccess(user)
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không đúng")
      }
    } catch (error) {
      console.error("🚨 Login error:", error)
      setError("Đã xảy ra lỗi khi đăng nhập")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Video Background */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/videos/auth-bg.mp4" type="video/mp4" />
        <source src="/videos/auth-bg.webm" type="video/webm" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Login Form */}
      <Card className="w-full max-w-md mx-4 bg-gray-900/90 backdrop-blur-md border-gray-700 z-20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/Logo-An-Kun-Studio-White.png" alt="AKs Studio" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Music className="h-6 w-6 text-purple-400" />
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-gray-400">Chào mừng trở lại với AKs Studio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </div>
              )}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                className="text-purple-400 hover:text-purple-300"
                onClick={onSwitchToForgotPassword}
              >
                Quên mật khẩu?
              </Button>
              <div className="text-gray-400">
                Chưa có tài khoản?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="text-purple-400 hover:text-purple-300 p-0"
                  onClick={onSwitchToRegister}
                >
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
