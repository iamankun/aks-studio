"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AlertModal } from "@/components/modals/alert-modal"
import { Disc3 } from "lucide-react"

interface RegistrationViewProps {
  onRegistrationSuccess: () => void
  onShowLogin: () => void
}

export default function RegistrationView({ onRegistrationSuccess, onShowLogin }: Readonly<RegistrationViewProps>) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState<string[]>([])
  const [modalTitle, setModalTitle] = useState("")
  const [modalType, setModalType] = useState<"success" | "error">("error")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      setModalTitle("Lỗi đăng ký")
      setModalMessage(["Mật khẩu xác nhận không khớp."])
      setModalType("error")
      setIsModalOpen(true)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, full_name: fullName }),
      })

      const result = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setModalTitle("Đăng ký thành công")
        setModalMessage([result.message ?? "Tài khoản đã được tạo thành công!"])
        setModalType("success")
        setIsModalOpen(true)
        setUsername("")
        setPassword("")
        setConfirmPassword("")
        setEmail("")
        setFullName("")
        setTimeout(() => onRegistrationSuccess(), 2000)
      } else {
        setModalTitle("Lỗi đăng ký")
        setModalMessage([result.message ?? "Không thể tạo tài khoản."])
        setModalType("error")
        setIsModalOpen(true)
      }
    } catch (error) {
      setIsLoading(false)
      setModalTitle("Lỗi đăng ký")
      setModalMessage(["Đã xảy ra lỗi kết nối. Vui lòng thử lại."])
      setModalType("error")
      setIsModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Video Background */}
      <video autoPlay muted loop className="absolute inset-0 w-full h-full object-cover opacity-30">
        <source src="/videos/auth-bg.mp4" type="video/mp4" />
        <source src="/videos/auth-bg.webm" type="video/webm" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <Card className="relative z-10 w-full max-w-lg border border-gray-700 bg-gray-800/90 backdrop-blur-md">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <img src="/Logo-An-Kun-Studio-White.png" alt="AKs Studio" className="h-12 w-auto mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white">Đăng ký tài khoản</h2>
            <p className="text-gray-400 mt-2">Tạo tài khoản mới để quản lý âm nhạc.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-300 mb-1">
                Họ tên đầy đủ
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-1">
                Tên đăng nhập
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-1">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-300 mb-1">
                Xác nhận mật khẩu
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? <Disc3 className="h-5 w-5 animate-spin" /> : "Đăng ký"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Đã có tài khoản?
              <Button
                type="button"
                variant="link"
                onClick={onShowLogin}
                className="font-semibold text-purple-400 hover:text-purple-300"
              >
                Đăng nhập ngay
              </Button>
            </p>
          </form>
        </CardContent>
      </Card>

      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        messages={modalMessage}
        type={modalType}
      />
    </div>
  )
}
