"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTerminalLogs } from "@/components/test-terminal-logs" // This import is correct and exists.
import { logger } from "@/lib/logger"
import type { User } from "@/types/user"
import { TestLogin } from "@/components/auth/test-login" // Import component TestLogin
import { UserMenu } from "@/components/auth/user-menu"

export default function TestPage() {
    const [user, setUser] = useState<User | null>(null)

    // Hàm này sẽ được truyền cho TestLogin để xử lý khi đăng nhập thành công
    const handleLoginSuccess = (loggedInUser: User) => {
        logger.info("Login success on debug page", { userId: loggedInUser.id }, { component: "TestPage" });
        setUser(loggedInUser);
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    AKs Studio Test Console
                </h1>
                <UserMenu />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    {/* Sử dụng lại component TestLogin và truyền hàm callback */}
                    <TestLogin onLoginSuccess={handleLoginSuccess} />

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
