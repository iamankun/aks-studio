"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, RefreshCw, ArrowLeft } from "lucide-react"
import Image from "next/image"

interface ResetPasswordViewProps {
    onResetPassword: (email: string) => Promise<{ success: boolean; message?: string }>
    onBackToLogin: () => void
}

export function ResetPasswordView({ onResetPassword, onBackToLogin }: Readonly<ResetPasswordViewProps>) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isReloading, setIsReloading] = useState(false)
    const [currentRecovery, setCurrentRecovery] = useState("Khôi phục")
    const [recoveryIndex, setRecoveryIndex] = useState(0)
    const [binaryText, setBinaryText] = useState("")
    const [appSettings, setAppSettings] = useState({
        appName: "AKs Studio",
        logoUrl: "/face.png"
    })

    // Recovery messages in different languages
    const recoveryMessages = [
        "Khôi phục", "Récupération", "Recovery", "復元", "Recuperación",
        "Wiederherstellung", "Recupero", "पुनर्प्राप्ति", "Восстановление", "복구"
    ]

    // Binary encoding
    const textToBinary = (text: string) => {
        return text.split('').map(char =>
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join(' ')
    }

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

    // Cycle through recovery messages
    useEffect(() => {
        const interval = setInterval(() => {
            setRecoveryIndex((prev) => (prev + 1) % recoveryMessages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [recoveryMessages.length])

    // Update recovery message with fade effect
    useEffect(() => {
        const recoveryEl = document.querySelector('.recovery-text')
        if (recoveryEl) {
            recoveryEl.classList.add('opacity-0')
            setTimeout(() => {
                setCurrentRecovery(recoveryMessages[recoveryIndex])
                recoveryEl.classList.remove('opacity-0')
            }, 200)
        } else {
            setCurrentRecovery(recoveryMessages[recoveryIndex])
        }
    }, [recoveryIndex, recoveryMessages])

    // Binary text animation for email
    useEffect(() => {
        if (email) {
            const binary = textToBinary(email)
            setBinaryText(binary)
        } else {
            setBinaryText("")
        }
    }, [email])

    // Email change detection with light sweep
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setEmail(value)

        if (value.length > 0) {
            const reloadBtn = document.querySelector('.reload-button')
            reloadBtn?.classList.add('light-sweep')
            setTimeout(() => {
                reloadBtn?.classList.remove('light-sweep')
            }, 500)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const result = await onResetPassword(email)
            if (result.success) {
                setSuccess(result.message ?? "Email khôi phục đã được gửi!")
            } else {
                setError(result.message ?? "Gửi email khôi phục thất bại")
            }
        } catch (err) {
            console.error("Reset password error:", err)
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

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Background with transparency - Green/Cyan theme for recovery */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 via-teal-100/70 to-cyan-100/80 backdrop-blur-sm"></div>

            {/* Left Column - Reset Form */}
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

                            {/* Dynamic Recovery Message */}
                            <div className="mb-4">
                                <p className="text-lg text-gray-600 greeting-fade">
                                    <span className="recovery-text transition-all duration-300">{currentRecovery}</span>
                                </p>
                                <p className="text-sm text-green-600 font-medium user-role-fade animate-pulse">
                                    🔐 Mật khẩu của bạn
                                </p>
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                Đặt lại mật khẩu
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600">
                                Nhập email để nhận liên kết đặt lại mật khẩu
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Địa chỉ email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        placeholder="your.email@example.com"
                                        required
                                        className="transition-all duration-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    {/* Binary text display */}
                                    {binaryText && (
                                        <div className="text-xs text-gray-500 font-mono p-2 bg-gray-50 rounded border overflow-hidden">
                                            <div className="binary-animation">{binaryText}</div>
                                        </div>
                                    )}
                                </div>

                                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                                {success && <div className="text-green-500 text-sm text-center">{success}</div>}

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 genZ-shimmer transition-all duration-300 hover:scale-105 active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Mail className="mr-2 h-4 w-4 animate-spin" />
                                            Đang gửi email...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Gửi email khôi phục
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-4 text-center">
                                <Button
                                    variant="link"
                                    onClick={onBackToLogin}
                                    className="text-sm transition-all duration-300 hover:scale-105"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Quay lại đăng nhập
                                </Button>
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg text-sm text-center border border-green-200/50">
                                <strong className="text-green-700">Lưu ý:</strong>
                                <br />
                                <span className="text-green-600">Kiểm tra cả hộp thư spam/junk mail</span>
                                <br />
                                <span className="text-green-600">Link khôi phục có hiệu lực trong 24h</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Column - Info */}
            <div className="relative z-10 flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <Card className="glass-card">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center shadow-xl">
                                    <Mail className="text-white text-3xl" />
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                                Bảo mật tài khoản
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600 mt-4">
                                Chúng tôi sẽ gửi link đặt lại mật khẩu an toàn đến email của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Bảo mật cao với mã hóa</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Link có thời hạn giới hạn</span>
                                </div>
                                <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">Xác thực qua email</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    © 2025 {appSettings.appName}. Hệ thống bảo mật đa lớp.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Floating decorative elements - Recovery theme */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-xl floating"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full blur-xl floating"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400/10 to-green-400/10 rounded-full blur-2xl floating"></div>

            {/* Additional GenZ floating elements */}
            <div className="absolute top-10 right-1/3 w-16 h-16 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-lg blur-lg floating rotate-45"></div>
            <div className="absolute bottom-10 left-1/3 w-20 h-20 bg-gradient-to-br from-teal-400/30 to-green-400/30 rounded-full blur-lg floating"></div>
            <div className="absolute top-1/3 right-10 w-12 h-12 bg-gradient-to-br from-cyan-400/40 to-teal-400/40 rounded-full blur-md floating"></div>
        </div>
    )
}
