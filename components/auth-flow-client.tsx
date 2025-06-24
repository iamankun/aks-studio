"use client"

import { useState } from "react"
import { LoginView } from "./auth/login-view"
import { RegistrationView } from "./auth/registration-view"
import { ForgotPasswordView } from "./auth/forgot-password-view"

interface AuthFlowClientProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
}

export function AuthFlowClient({ onLogin }: AuthFlowClientProps) {
  const [currentView, setCurrentView] = useState<"login" | "register" | "forgot">("login")

  const handleSwitchView = (view: "login" | "register" | "forgot") => {
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {currentView === "login" && (
        <LoginView
          onLogin={onLogin}
          onSwitchToRegister={() => handleSwitchView("register")}
          onSwitchToForgot={() => handleSwitchView("forgot")}
        />
      )}
      {currentView === "register" && <RegistrationView onSwitchToLogin={() => handleSwitchView("login")} />}
      {currentView === "forgot" && <ForgotPasswordView onSwitchToLogin={() => handleSwitchView("login")} />}
    </div>
  )
}
