"use client"

import { useState } from "react"
import { TestLogin } from "@/components/auth/test-login"
import MainAppView from "@/components/main-app-view"
import type { User } from "@/types/user"

export default function TestPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  if (currentUser) {
    return <MainAppView initialUser={currentUser} />
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <TestLogin onLoginSuccess={setCurrentUser} />
    </div>
  )
}
