"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  onSwitchToRegister: () => void
  onSwitchToForgot: () => void
}

export function LoginView({ onLogin, onSwitchToRegister, onSwitchToForgot }: LoginViewProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await onLogin(username, password)
      if (!result.success) {
        setError(result.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      setError("Đã xảy ra lỗi không mong muốn")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>Đăng nhập vào AKs Studio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ankunstudio"
                required
              />
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
            <Button type="submit" className="w-full" disabled={loading}>
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
          <div className="mt-4 text-center space-y-2">
            <Button variant="link" onClick={onSwitchToForgot} className="text-sm">
              Quên mật khẩu?
            </Button>
            <div>
              <Button variant="link" onClick={onSwitchToRegister} className="text-sm">
                Chưa có tài khoản? Đăng ký ngay
              </Button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-center">
            <strong>Demo Account:</strong>
            <br />
            Username: ankunstudio
            <br />
            Password: admin
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
