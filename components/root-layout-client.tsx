"use client"

import React, { useState, useEffect } from "react"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { MainContentLayout } from "@/components/main-content-layout"
import { DynamicBackground } from "@/components/dynamic-background"
import { AiChatButton } from "@/components/ai-chat-button"
import { LoadingScreen } from "@/components/loading-screen"

interface RootLayoutClientProps {
    readonly children: React.ReactNode
    readonly className?: string
}

export function RootLayoutClient({ children, className }: RootLayoutClientProps) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Giả lập thời gian tải trang
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 3000)

        return () => clearTimeout(timer)
    }, [])

    return (
        <body className={className} suppressHydrationWarning>
            {isLoading ? (
                <LoadingScreen
                    title="An Kun Studio"
                    subtitle="Đang tải trang..."
                    duration={3000}
                    logoUrl="\loading.webm"
                    isAnimation={true}
                    onComplete={() => setIsLoading(false)}
                />
            ) : (
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <AuthProvider>
                        <DynamicBackground />
                        <MainContentLayout>
                            {children}
                        </MainContentLayout>
                        <AiChatButton />
                    </AuthProvider>
                </ThemeProvider>
            )}
        </body>
    )
}
