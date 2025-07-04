"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

import Image from "next/image"
import "@/components/awesome/css/all.min.css"

interface ForgotPasswordViewProps {
  onBackToLogin: () => void
}

export function ForgotPasswordView({ onBackToLogin }: Readonly<ForgotPasswordViewProps>) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setMessage(result.message)
      } else {
        setError(result.message ?? "Không thể gửi email. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error("🚨 Forgot password error:", error)
      setError("Đã xảy ra lỗi. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Dynamic Background System */}


      {/* Forgot Password Form */}
      <Card className="w-full max-w-md mx-4 bg-card/90 backdrop-blur-md border-primary/20 shadow-lg transition-all duration-300 relative overflow-hidden z-20">

        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/30 via-transparent to-primary/30 z-0 rounded-lg"></div>

        <CardHeader className="text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-1000 animate-pulse"></div>
              <Image
                src="/face.png"
                alt="AKs Studio"
                width={64}
                height={64}
                className="relative z-10 rounded-full"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground relative">
            <span className="relative">
              <i className="fas fa-key text-sm absolute -left-6 top-1 opacity-70" /> Quên mật khẩu <i className="fas fa-shield-alt text-sm absolute -right-6 top-1 opacity-70" />
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            <i className="fas fa-envelope-open-text mr-1 text-primary/70"></i> Nhập email để nhận hướng dẫn đặt lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-60 blur group-hover:opacity-100 transition duration-500"></div>
                  <i className="fas fa-check-circle text-5xl text-green-500 relative z-10"></i>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-green-500">Email đã được gửi!</h3>
              <p className="text-muted-foreground">{message}</p>
              <Button
                onClick={onBackToLogin}
                className="w-full bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
              >
                <i className="fas fa-arrow-left mr-2" /> Quay lại đăng nhập
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertDescription className="text-red-400 flex items-center">
                      <i className="fas fa-exclamation-circle mr-2"></i>{error}
                    </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <i className="fas fa-envelope text-primary/70"></i> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email của bạn"
                    className="bg-card/50 border-primary/30 focus:border-primary/70 transition-all duration-300"
                  required
                />
              </div>

              <Button
                type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                      <i className="fas fa-spinner fa-spin mr-2" /> Đang gửi...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                        <i className="fas fa-paper-plane mr-2" /> Gửi email đặt lại
                  </div>
                )}
                </Button>              <Button
                type="button"
                variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                onClick={onBackToLogin}
              >
                  <i className="fas fa-arrow-left mr-2" /> Quay lại đăng nhập
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
