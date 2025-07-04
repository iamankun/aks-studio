"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card"
import { LogOut, Loader2 } from "lucide-react"
import Image from "next/image"


interface LogoutViewProps {
    onLogout: () => Promise<{ success: boolean; message?: string }>
    onCancel: () => void
    userName?: string
    userRole?: string
}

export function LogoutView({ onLogout, onCancel, userName, userRole }: Readonly<LogoutViewProps>) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [currentFarewell, setCurrentFarewell] = useState("Tạm biệt")
    const [farewellIndex, setFarewellIndex] = useState(0)

    // Farewell messages in different languages
    const farewells = useMemo(() => [
        "Tạm biệt", "Au revoir", "Goodbye", "Sayonara", "Adiós",
        "Auf Wiedersehen", "Arrivederci", "अलविदा", "До свидания", "안녕히 가세요"
    ], [])

    // Update farewell periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setFarewellIndex((prev) => (prev + 1) % farewells.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [farewells.length])

    // Update farewell with fade effect
    useEffect(() => {
        const farewellEl = document.querySelector('.farewell-text')
        if (farewellEl) {
            farewellEl.classList.add('opacity-0')
            setTimeout(() => {
                setCurrentFarewell(farewells[farewellIndex])
                farewellEl.classList.remove('opacity-0')
            }, 200)
        } else {
            setCurrentFarewell(farewells[farewellIndex])
        }
    }, [farewellIndex, farewells])

    const handleLogout = async () => {
        setLoading(true)
        setError("")

        try {
            const result = await onLogout()
            if (!result.success) {
                setError(result.message ?? "Đăng xuất thất bại")
            }
        } catch (err) {
            console.error("Logout error:", err)
            setError("Đã xảy ra lỗi không mong muốn")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 relative overflow-hidden">

            <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl
                bg-background/60 backdrop-blur-xl hover:bg-background/70 transition-all duration-300
                before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-white/5 before:rounded-xl">
                <CardHeader className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto transform hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/face.png"
                            alt="Logo"
                            fill
                            className="object-cover rounded-full p-1.5 bg-background/40 backdrop-blur-sm 
                                shadow-lg hover:shadow-xl transition-all duration-300"
                            priority
                        />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-center farewell-text transition-all duration-300 ease-out
                            hover:text-primary/90">
                            {currentFarewell}
                            {userName ? `, ${userName}` : ""}
                        </h2>
                        {userRole && (
                            <p className="text-muted-foreground text-sm animate-fade-in">
                                {userRole}
                            </p>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <CardDescription className="text-center text-base">
                        Bạn có chắc chắn muốn đăng xuất không?
                    </CardDescription>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center animate-fade-in">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="w-full sm:w-1/3 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-300"
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full sm:w-2/3 gap-2 hover:bg-destructive/90 transition-colors duration-300"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LogOut className="h-4 w-4" />
                            )}
                            {loading ? "Đang xử lý..." : "Đăng xuất"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
