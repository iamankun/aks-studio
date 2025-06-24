"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Send } from "lucide-react"

interface ForgotPasswordViewProps {
  onBackToLogin: () => void
}

export default function ForgotPasswordView({ onBackToLogin }: ForgotPasswordViewProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      // Call API to send reset password email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: "Đặt lại mật khẩu - AKs Studio",
          textBody: `
Xin chào,

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AKs Studio.

Vui lòng liên hệ với chúng tôi qua email admin@ankun.dev hoặc qua các kênh hỗ trợ để được hỗ trợ đặt lại mật khẩu.

Trân trọng,
An Kun Studio Digital Music Distribution
          `,
          htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8b5cf6;">Đặt lại mật khẩu - AKs Studio</h2>
  <p>Xin chào,</p>
  <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AKs Studio.</p>
  <p>Vui lòng liên hệ với chúng tôi qua email <strong>admin@ankun.dev</strong> hoặc qua các kênh hỗ trợ để được hỗ trợ đặt lại mật khẩu.</p>
  <br>
  <p>Trân trọng,<br>
  <strong>An Kun Studio Digital Music Distribution</strong></p>
</div>
          `,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.")
      } else {
        setError(result.message || "Không thể gửi email. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("🚨 Forgot password error:", error)
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
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

      {/* Forgot Password Form */}
      <Card className="w-full max-w-md mx-4 bg-gray-900/90 backdrop-blur-md border-gray-700 z-20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/Logo-An-Kun-Studio-White.png" alt="AKs Studio" className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Mail className="h-6 w-6 text-purple-400" />
            Quên mật khẩu
          </CardTitle>
          <CardDescription className="text-gray-400">Nhập email để nhận hướng dẫn đặt lại mật khẩu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-green-500 bg-green-500/10">
                <AlertDescription className="text-green-400">{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Gửi email đặt lại
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
