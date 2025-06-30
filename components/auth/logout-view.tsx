"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { LogOut, RefreshCw } from "lucide-react"
import Image from "next/image"
import { DynamicBackground } from "@/components/dynamic-background"

interface LogoutViewProps {
    onLogout: () => Promise<{ success: boolean; message?: string }>
    onCancel: () => void
    userName?: string
    userRole?: string
}

export function LogoutView({ onLogout, onCancel, userName, userRole }: Readonly<LogoutViewProps>) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [isReloading, setIsReloading] = useState(false)
    const [currentFarewell, setCurrentFarewell] = useState("Tạm biệt")
    const [farewellIndex, setFarewellIndex] = useState(0)
    const [lastSweepTime, setLastSweepTime] = useState(0)
    const [appSettings, setAppSettings] = useState({
        appName: "AKs Studio",
        logoUrl: "/face.png"
    })

    // Farewell messages in different languages
    const farewells = [
        "Tạm biệt", "Au revoir", "Goodbye", "Sayonara", "Adiós",
        "Auf Wiedersehen", "Arrivederci", "अलविदा", "До свидания", "안녕히 가세요"
    ]

    // Load app settings
    useEffect(() => {
        const savedApp = localStorage.getItem("appSettings_v2")
        if (savedApp) {
            try {
                const parsed = JSON.parse(savedApp)
                setAppSettings(parsed)
            } catch (err) {
                console.error("Failed to load app settings:", err)
            }
        }
    }, [])

    // Cycle through farewells
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

    const handleReload = () => {
        setIsReloading(true)
        const btn = document.querySelector('.reload-button')
        btn?.classList.add('light-sweep-active')

        setTimeout(() => {
            btn?.classList.remove('light-sweep-active')
            window.location.reload()
        }, 800)
    }

    // Light sweep throttling for logout button
    const SWEEP_COOLDOWN = 2000 // 2 seconds cooldown

    // Throttled light sweep function for logout
    const triggerLightSweep = (isIntense = false) => {
        const now = Date.now()
        if (now - lastSweepTime < SWEEP_COOLDOWN) {
            return // Skip if still in cooldown
        }
        setLastSweepTime(now)
        const btn = document.querySelector('.logout-button')
        if (!btn) return
        const className = isIntense ? 'light-sweep-intense' : 'light-sweep'
        btn.classList.remove('light-sweep', 'light-sweep-intense')
        requestAnimationFrame(() => {
            btn.classList.add(className)
        })
        setTimeout(() => {
            btn.classList.remove(className)
        }, 2000)
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Dynamic Background */}
            <DynamicBackground />

            {/* Center Column - Logout Confirmation */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Reload Button */}
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReload}
                            disabled={isReloading}
                            className={`reload-button bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90 transition-all duration-300 ${isReloading ? 'reload-pulsing' : ''}`}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {isReloading ? 'Đang tải...' : 'Reload'}
                        </Button>
                    </div>

                    <Card className="glass-card">
                        <CardHeader className="text-center">
                            {/* Logo */}
                            <div className="flex justify-center mb-4">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white/50">
                                    <Image
                                        src={appSettings.logoUrl}
                                        alt={`${appSettings.appName} Logo`}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "/face.png"
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Farewell */}
                            <div className="mb-4">
                                <p className="text-lg text-gray-600 greeting-fade">
                                    <span className="farewell-text transition-all duration-300">{currentFarewell}</span>
                                </p>
                                {userName && userRole && (
                                    <p className="text-sm text-orange-600 font-medium user-role-fade animate-pulse">
                                        👋 {userRole} {userName}
                                    </p>
                                )}
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Đăng xuất
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600">
                                Bạn có chắc chắn muốn đăng xuất khỏi {appSettings.appName}?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                                <div className="flex space-x-3">
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 genZ-shimmer transition-all duration-300 hover:scale-105 active:scale-95 logout-button"
                                        disabled={loading}
                                        onMouseEnter={() => triggerLightSweep(false)}
                                        onClick={e => { triggerLightSweep(true); handleLogout(); }}
                                    >
                                        {loading ? (
                                            <>
                                                <LogOut className="mr-2 h-4 w-4 animate-spin" />
                                                Đang đăng xuất...
                                            </>
                                        ) : (
                                            <>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Đăng xuất
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={onCancel}
                                        className="flex-1 transition-all duration-300 hover:scale-105 active:scale-95"
                                    >
                                        Hủy bỏ
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Floating decorative elements - Logout theme */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-full blur-xl floating"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-xl floating"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-yellow-400/10 to-red-400/10 rounded-full blur-2xl floating"></div>

            {/* Additional GenZ floating elements */}
            <div className="absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-red-400/30 to-pink-400/30 rounded-lg blur-lg floating rotate-45"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full blur-lg floating"></div>
            <div className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-yellow-400/40 to-orange-400/40 rounded-full blur-md floating"></div>
        </div>
    )
}
