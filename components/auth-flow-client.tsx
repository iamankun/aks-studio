"use client"

import { useState, useEffect } from "react"
import LoginView from "@/components/auth/login-view"
import RegistrationView from "@/components/auth/registration-view"
import ForgotPasswordView from "@/components/auth/forgot-password-view"
import MainAppView from "@/components/main-app-view"
import type { User } from "@/types/user"
import { createClient } from "@/ultis/supabase/client"

interface AuthFlowClientProps {
  initialUser: User | null
}

export default function AuthFlowClient({ initialUser }: Readonly<AuthFlowClientProps>) {
  const [currentView, setCurrentView] = useState<"login" | "registration" | "forgot-password" | "main">(
    initialUser ? "main" : "login",
  )
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user)

      if (session?.user) {
        // Fetch user data from database
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        console.log("User data from DB:", userData, error)

        if (userData) {
          const user: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role, // Lấy role từ database
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            social_links: userData.social_links,
            isrc_code_prefix: userData.isrc_code_prefix,
            created_at: userData.created_at,
          }
          console.log("Final user object:", user)
          setCurrentUser(user)
          setCurrentView("main")
        }
      } else {
        setCurrentUser(null)
        setCurrentView((prevView) => {
          if (prevView === "registration" || prevView === "forgot-password") {
            return prevView
          }
          return "login"
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {currentView === "login" && (
        <LoginView
          onShowRegister={() => setCurrentView("registration")}
          onShowForgotPassword={() => setCurrentView("forgot-password")}
        />
      )}

      {currentView === "registration" && (
        <RegistrationView
          onRegistrationSuccess={() => setCurrentView("login")}
          onShowLogin={() => setCurrentView("login")}
        />
      )}

      {currentView === "forgot-password" && <ForgotPasswordView onBackToLogin={() => setCurrentView("login")} />}

      {currentView === "main" && currentUser && <MainAppView currentUser={currentUser} />}
    </main>
  )
}
