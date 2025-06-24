"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import AdminPanelView from "@/components/views/admin-panel-view"

const MainAppView: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push("/login")
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
      {session?.user?.email === "admin@example.com" && <AdminPanelView />}
    </div>
  )
}

export default MainAppView
