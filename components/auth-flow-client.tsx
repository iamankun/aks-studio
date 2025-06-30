"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthFlowClientProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>
}

export function AuthFlowClient({ onLogin }: Readonly<AuthFlowClientProps>) {
  const [currentView, setCurrentView] = useState<"login" | "register" | "forgot">("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSwitchView = (view: "login" | "register" | "forgot") => {
    setCurrentView(view)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await onLogin(username, password)
      if (!result.success) {
        setError(result.message)
      }
    } catch (error) {
      setError("Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {currentView === "login" && (
        <Card className="w-full max-w-md mx-auto bg-gray-800/90 backdrop-blur-md border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              🎵 AKs Studio Login
            </CardTitle>
            <p className="text-gray-400">Digital Music Distribution</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ankunstudio"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="mt-1"
                  required
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Demo Account:</p>
              <p>Username: ankunstudio</p>
              <p>Password: admin</p>
            </div>
          </CardContent>
        </Card>
      )}
      {currentView === "register" && <RegistrationView onSwitchToLogin={() => handleSwitchView("login")} />}
      {currentView === "forgot" && <ForgotPasswordView onBackToLogin={() => handleSwitchView("login")} />}
    </div>
  )
}
