"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/types/user"
import { useUser } from "@/lib/hooks/use-user"
import { logger } from "@/lib/logger"

interface TestLoginProps {
  readonly onLoginSuccess: (user: User) => void
}

export function TestLogin({ onLoginSuccess }: TestLoginProps) {
  const [username, setUsername] = useState("ankunstudio")
  const [password, setPassword] = useState("admin")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { mutate } = useUser()

  const handleTestLogin = async () => {
    setIsLoading(true)
    setMessage("Đang đăng nhập...")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setMessage(`✅ Đăng nhập thành công! Role: ${result.data.role}`)
        logger.info("Test login successful", { userId: result.data.id });
        
        // Trigger a re-fetch of the user status, which will update the UserMenu
        await mutate(); 
        
        onLoginSuccess(result.data)
      } else {
        setMessage(`❌ Đăng nhập thất bại: ${result.message || 'Kiểm tra lại thông tin'}`)
        logger.warn("Test login failed", { reason: result.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      setMessage(`🚨 Lỗi kết nối: ${errorMessage}`)
      logger.error("Test login error:", error);
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
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>

        {message && (
          <div
            className={`p-3 rounded text-sm ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : message.includes("❌") || message.includes("🚨")
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
