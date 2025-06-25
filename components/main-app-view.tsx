"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar/sidebar"
import { UploadFormView } from "./upload-form-view"
import { SubmissionsView } from "./views/submissions-view"
import { MyProfileView } from "./views/my-profile-view"
import { SettingsView } from "./views/settings-view"
import { UsersView } from "./views/users-view"
import { AdminPanelView } from "./views/admin-panel-view"
import { EmailCenterView } from "./views/email-center-view"
import { DynamicBackground } from "./dynamic-background"
import { NotificationSystem } from "./notification-system"
import { SoundSystem } from "./sound-system"

interface MainAppViewProps {
  user: any
  onLogout: () => void
}

export default function MainAppView({ user, onLogout }: MainAppViewProps) {
  const [activeView, setActiveView] = useState("upload")

  // Add loading state if user is not available
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case "upload":
        return <UploadFormView />
      case "submissions":
        return <SubmissionsView />
      case "profile":
        return <MyProfileView />
      case "settings":
        return <SettingsView />
      case "users":
        return user?.role === "Label Manager" ? <UsersView /> : <div>Access Denied</div>
      case "admin":
        return user?.role === "Label Manager" ? <AdminPanelView /> : <div>Access Denied</div>
      case "email":
        return user?.role === "Label Manager" ? <EmailCenterView /> : <div>Access Denied</div>
      default:
        return <UploadFormView />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DynamicBackground user={user} />
      <div className="flex">
        <Sidebar user={user} activeView={activeView} onViewChange={setActiveView} onLogout={onLogout} />
        <main className="flex-1 p-6">{renderView()}</main>
      </div>
      <NotificationSystem />
      <SoundSystem />
    </div>
  )
}

// Also export as named export for compatibility
export { MainAppView }
