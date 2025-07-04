"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Loader2, User, Mail, Lock, Shield } from "lucide-react"
import Image from "next/image"
import { logUIInteraction, logRegistration } from "@/lib/client-activity-log"

import "@/components/awesome/css/all.min.css"

interface RegisterViewProps {
    onRegister: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>
    onSwitchToLogin: () => void
}

export function RegisterView({ onRegister, onSwitchToLogin }: Readonly<RegisterViewProps>) {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [agreed, setAgreed] = useState(false)
    const [validationErrors, setValidationErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const validateForm = useCallback(() => {
        const errors = {
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
        let isValid = true

        if (username.length < 3) {
            errors.username = "Username phải có ít nhất 3 ký tự"
            isValid = false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            errors.email = "Email không hợp lệ"
            isValid = false
        }

        if (password.length < 6) {
            errors.password = "Password phải có ít nhất 6 ký tự"
            isValid = false
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "Mật khẩu không khớp"
            isValid = false
        }

        setValidationErrors(errors)
        return isValid
    }, [username, email, password, confirmPassword])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setSuccessMessage("")

        if (!validateForm()) {
            return
        }

        if (!agreed) {
            setError("Bạn phải đồng ý với điều khoản sử dụng")
            return
        }

        setLoading(true)

        // Log the registration attempt
        logUIInteraction('form', 'register-form', {
            username: username,
            email_domain: email.split('@')[1]
        });

        try {
            const result = await onRegister(username, email, password)
            console.log("[Copilot Debug] API register result:", result)
            if (result.success) {
                // Log successful registration
                logRegistration('email', 'success', {
                    username: username,
                    email_domain: email.split('@')[1]
                });

                setSuccessMessage("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.")
                // Reset form
                setUsername("")
                setEmail("")
                setPassword("")
                setConfirmPassword("")
                setAgreed(false)
            } else {
                // Log failed registration
                logRegistration('email', 'failed', {
                    username: username,
                    email_domain: email.split('@')[1],
                    error: result.message
                });

                setError(result.message || "Đăng ký thất bại, vui lòng thử lại")
            }
        } catch (error) {
            console.error("[Copilot Debug] Register error:", error)

            // Log error during registration
            logRegistration('email', 'error', {
                username: username,
                email_domain: email.split('@')[1],
                error: error.message
            });

            setError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center p-4 relative overflow-hidden">

            <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl 
                bg-background/60 backdrop-blur-xl hover:bg-background/70 transition-all duration-300
                before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-white/5 before:rounded-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                        <Image
                            src="/face.png"
                            alt="Logo"
                            fill
                            className="object-cover rounded-full p-1 bg-background/40 backdrop-blur-sm"
                            priority
                        />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent 
                        bg-gradient-to-r from-indigo-500 to-pink-500">
                        Tạo tài khoản mới
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Tham gia cộng đồng AKs Studio
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                            <div className="relative">
                                <Input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 bg-background/40 border-muted-foreground/20 focus:border-primary/50"
                                    placeholder="Choose a username"
                                    disabled={loading}
                                />
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/70" />
                            </div>
                            {validationErrors.username && (
                                <p className="text-destructive text-sm mt-1">{validationErrors.username}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-background/40 border-muted-foreground/20 focus:border-primary/50"
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/70" />
                            </div>
                            {validationErrors.email && (
                                <p className="text-destructive text-sm mt-1">{validationErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-background/40 border-muted-foreground/20 focus:border-primary/50"
                                    placeholder="Choose a password"
                                    disabled={loading}
                                />
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/70" />
                            </div>
                            {validationErrors.password && (
                                <p className="text-destructive text-sm mt-1">{validationErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 bg-background/40 border-muted-foreground/20 focus:border-primary/50"
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                />
                                <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground/70" />
                            </div>
                            {validationErrors.confirmPassword && (
                                <p className="text-destructive text-sm mt-1">{validationErrors.confirmPassword}</p>
                            )}
                        </div>

                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="rounded border-muted-foreground/20"
                            />
                            <span className="text-sm text-muted-foreground">
                                Tôi đồng ý với các điều khoản sử dụng
                            </span>
                        </label>

                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                                {successMessage}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full relative overflow-hidden group"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span className="relative z-10">Register</span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </>
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                logUIInteraction('button', 'switch-to-login', {
                                    from: 'register'
                                });
                                onSwitchToLogin();
                            }}
                            className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            Already have an account? Login
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
