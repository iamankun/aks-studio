"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTerminalLogs } from "@/components/test-terminal-logs" // This import is correct and exists.
import { dbService } from "@/lib/database-service"
import { logger } from "@/lib/logger"
import type { User } from "@/types/user"

export default function TestPage() {
    const [username, setUsername] = useState("ankunstudio")
    const [password, setPassword] = useState("admin")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [user, setUser] = useState<User | null>(null)

    const handleTestLogin = async () => {
        setIsLoading(true)
        setMessage("Đang kiểm tra authentication...")
        logger.info("Test login attempt", { username }, { component: "TestPage" })

        try {
            const result = await dbService.authenticateUser(username, password)

            if (result.success && result.data) {
                logger.info("Test login successful", { userId: result.data.id }, { component: "TestPage" })
                setMessage(`✅ Đăng nhập thành công! Role: ${result.data.role}`)
                setUser(result.data)
            } else {
                logger.warn("Test login failed", { reason: result.error }, { component: "TestPage" })
                setMessage("❌ Đăng nhập thất bại! Kiểm tra username/password")
            }
        } catch (error) {
            logger.error("Test login error", error, { component: "TestPage" })
            setMessage("🚨 Lỗi kết nối database")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <h1 className="text-3xl font-bold text-center mb-6">
                AKs Studio Test Console
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="w-full">
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
                                    className={`p-3 rounded text-sm ${message.includes("✅")
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

                    {user && (
                        <Card className="w-full mt-4">
                            <CardHeader>
                                <CardTitle>👤 User Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <p><strong>ID:</strong> {user.id}</p>
                                    <p><strong>Username:</strong> {user.username}</p>
                                    <p><strong>Role:</strong> {user.role}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Full Name:</strong> {user.fullName}</p>
                                    {user.isrcCodePrefix && (
                                        <p><strong>ISRC Prefix:</strong> {user.isrcCodePrefix}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-2">
                    <TestTerminalLogs />
                </div>
            </div>
        </div>
    )
}
