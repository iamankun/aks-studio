"use client"

import { useState } from "react"
import { LoginView } from "@/components/auth/login-view"
import { RegisterView } from "@/components/auth/register-view"
import { BackgroundSystem } from "@/components/background-system"
import { BackgroundSettingsPanel } from "@/components/background-settings-panel"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import type { User } from "@/types/user"

interface AuthContentProps {
  children: React.ReactNode
  showLogin: boolean
  showSettings: boolean
  setShowSettings: (show: boolean) => void
}

const AuthContent = ({ children, showLogin, showSettings, setShowSettings }: AuthContentProps) => (
  <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
    <BackgroundSystem />

    {/* Header bar with glass effect */}
    <div className="w-full h-16 flex items-center justify-between px-6 backdrop-blur-2xl bg-black/10 border-b border-white/10 z-50
      sticky top-0 transition-all duration-300 hover:bg-black/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-lg hover:border-white/40 transition-all duration-300 
          hover:shadow-primary/20 group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Image src="/face.png" alt="Logo" width={32} height={32}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" priority />
        </div>
        <span className="font-semibold text-foreground/90 bg-gradient-to-r from-white to-white/80 bg-clip-text hover:text-transparent transition-all duration-300">
          An Kun Studio
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="text-foreground/70 hover:text-foreground transition-all duration-300 gap-2 group
          bg-white/5 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/10"
        onClick={() => setShowSettings(!showSettings)}
      >
        <span className="text-sm relative">
          Background
          <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 
            opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
        </span>
        <Settings className="h-4 w-4 group-hover:rotate-90 group-hover:text-primary transition-all duration-300" />
      </Button>
    </div>

    {/* Settings panel */}
    <AnimatePresence>
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8
          }}
          className="absolute top-16 right-0 z-50 w-full max-w-sm overflow-hidden origin-top"
        >
          <div className="p-4">
            <BackgroundSettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Main content with glass card effect */}
    <div className="flex-1 flex items-center justify-center w-full px-4 py-8">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-20 h-20">
          <div className="w-full h-full rounded-full backdrop-blur-sm border border-white/20
                       shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300">
            <Image src="/public/media.webp" alt="An Kun Studio Logo Media" width={100} height={100} className="w-full h-full object-cover rounded-full" priority />
          </div>
        </div>

        {/* Auth container */}
        <motion.div
          className="w-full backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]
                     p-8 border border-white/20"
          layout
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={showLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  </div>
)

interface AuthFlowClientProps {
  onLoginSuccess: (userData: User) => void
  onLoginCancel: () => void
  onRegisterSuccess: (userData: User) => void
  onRegisterCancel: () => void
  showLogin: boolean
  showRegister: boolean
  onSwitchToRegister: () => void
  onSwitchToLogin: () => void
}

export function AuthFlowClient({
  onLoginSuccess,
  onLoginCancel,
  onRegisterSuccess,
  showLogin,
  showRegister,
  onSwitchToRegister,
  onSwitchToLogin
}: Readonly<AuthFlowClientProps>) {
  const [showSettings, setShowSettings] = useState(false)

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        onLoginSuccess(data.data)
        return { success: true }
      }

      return { success: false, message: data.message ?? "Đăng nhập thất bại" }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: "Đã xảy ra lỗi không mong muốn" }
    }
  }

  const handleRegister = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        onRegisterSuccess(data.data)
        return { success: true }
      }

      return { success: false, message: data.message ?? "Đăng ký thất bại" }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: "Đã xảy ra lỗi không mong muốn" }
    }
  }

  if (showLogin) {
    return (
      <AuthContent
        showLogin={showLogin}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      >
        <LoginView
          onLogin={handleLogin}
          onSwitchToRegister={onSwitchToRegister}
          onSwitchToForgot={onLoginCancel}
        />
      </AuthContent>
    )
  }

  if (showRegister) {
    return (
      <AuthContent
        showLogin={showLogin}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      >
        <RegisterView
          onRegister={handleRegister}
          onSwitchToLogin={onSwitchToLogin}
        />
      </AuthContent>
    )
  }

  return null
}
