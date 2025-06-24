"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authenticateUser } from "@/lib/auth-service"
import type { User } from "@/types/user"

interface TestLoginProps {
  onLoginSuccess: (user: User) => void
}

export function TestLogin({ onLoginSuccess }: TestLoginProps) {
  const [username, setUsername] = useState("ankunstudio")
  const [password, setPassword] = useState("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleTestLogin = async () => {
    setIsLoading(true)
    setMessage("Đang kiểm tra authentication...")

    try {
      const user = await authenticateUser(username, password)

      if (user) {
        setMessage(`✅ Đăng nhập thành công! Role: ${user.role}`)
        onLoginSuccess(user)
      } else {
        setMessage("❌ Đăng nhập thất bại! Kiểm tra username/password")
      }
    } catch (error) {
      console.error("Test login error:", error)
      setMessage("🚨 Lỗi kết nối database")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Test Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Username:</label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ankunstudio" />
        </div>

        <div>
          <label className="text-sm font-medium">Password:</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin" />
        </div>

        <Button onClick={handleTestLogin} disabled={isLoading} className="w-full">
          {isLoading ? "Đang test..." : "Test Login"}
        </Button>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : message.includes("❌")
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Test Data:</strong>
          </p>
          <p>Username: ankunstudio</p>
          <p>Password: admin</p>
          <p>Expected Role: Label Manager</p>
        </div>
      </CardContent>
    </Card>
  )
}
