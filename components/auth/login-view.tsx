// Tôi là An Kun
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { AlertModal } from "@/components/modals/alert-modal"
import type { User } from "@/types/user"
import { loginUser } from "@/lib/data"
import { Disc3, Shield } from 'lucide-react';
import { useSystemStatus } from "@/components/system-status-provider"

interface LoginViewProps {
  onLogin: (user: User) => void
  onShowRegister: () => void
}

export default function LoginView({ onLogin, onShowRegister }: LoginViewProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState<string[]>([])
  const [modalTitle, setModalTitle] = useState("")
  const [modalType, setModalType] = useState<"success" | "error">("error")
  const { status } = useSystemStatus()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Hàm loginUser đã xử lý việc tìm người dùng trong localStorage
    const foundUser = loginUser(username, password)
    if (foundUser) {
      onLogin(foundUser)
    } else {
      setModalTitle("Đăng nhập thất bại")
      setModalMessage(["Sai tên đăng nhập hoặc mật khẩu."])
      setIsModalOpen(true)
      setPassword("")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg border border-gray-700 bg-gray-800/90 backdrop-blur-md">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Disc3 className="h-12 w-12 text-purple-500 mr-2" />
              {status.isDemo && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-dosis-bold">Beta</span>
              )}
            </div>
            <h2 className="text-3xl font-dosis-bold text-white">Dashboard | Digital Music Distribution</h2>
            <p className="text-gray-400 mt-2 font-dosis">Đăng nhập để quản lý âm nhạc của bạn.</p>

            {status.isDemo && (
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                <p className="text-orange-300 text-sm font-dosis">
                  <Shield className="inline h-4 w-4 mr-1" />
                  Chế độ Demo - Cần cấu hình SMTP, Database để sử dụng đầy đủ
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-dosis-semibold text-gray-300 mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 font-dosis"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-dosis-semibold text-gray-300 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 font-dosis"
                  placeholder="Password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full bg-purple-600 hover:bg-purple-700 font-dosis-medium">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Đăng nhập
            </Button>

            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-2 font-dosis">📋 Tài khoản demo:</p>
              <div className="text-xs space-y-1 font-dosis">
                <p className="text-green-400">• Hình như bạn chưa có tài khoản</p>
                <p className="text-blue-400">• Vui lòng đăng ký hoặc liên hệ quản trị nếu tài khoản có vấn đề</p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-400 font-dosis">
              Chưa có tài khoản?
              <Button
                variant="link"
                onClick={onShowRegister}
                className="font-dosis-semibold text-purple-400 hover:text-purple-300"
              >
                Đăng ký tài khoản mới
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
