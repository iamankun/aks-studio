"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
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
      console.log("🔍 Login attempt:", { username })
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
      {/* YouTube Video Background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://www.youtube.com/embed/videoseries?list=PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO&autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1"
          className="absolute top-1/2 left-1/2 w-[177.77777778vh] h-[56.25vw] min-h-full min-w-full transform -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: 0.3 }}
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Login Form */}
      <Card className="w-full max-w-md mx-4 relative z-10 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src="/Logo An Kun Studio Black Text.png" alt="An Kun Studio" className="h-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">Nhập thông tin đăng nhập để truy cập hệ thống</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <div className="flex flex-col space-y-2 text-sm text-center">
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-blue-600 hover:underline"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
              <div>
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
