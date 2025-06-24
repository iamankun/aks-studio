"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/sidebar/collapsible-sidebar"
import UploadFormView from "@/components/views/upload-form-view"
import SubmissionsView from "@/components/views/submissions-view"
import UsersView from "@/components/views/users-view"
import AdminPanelView from "@/components/views/admin-panel-view"
import EmailCenterView from "@/components/views/email-center-view"
import MyProfileView from "@/components/views/my-profile-view"
import SettingsView from "@/components/views/settings-view"
import { AlertModal } from "@/components/modals/alert-modal"
import { NotificationSystem } from "@/components/notification-system"
import { SoundSystem } from "@/components/sound-system"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import { getCurrentUser } from "@/lib/auth-service"
import { loadSubmissionsFromLocalStorage, saveSubmissionsToLocalStorage } from "@/lib/data"

interface MainAppViewProps {
  initialUser: User
}

export default function MainAppView({ initialUser }: MainAppViewProps) {
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [currentView, setCurrentView] = useState("submissions")
  const [submissions, setSubmissions] = useState<Submission[]>([])

  // Modal state
  const [modalTitle, setModalTitle] = useState("")
  const [modalMessages, setModalMessages] = useState<string[]>([])
  const [modalType, setModalType] = useState<"error" | "success">("success")
  const [showModal, setShowModal] = useState(false)

  // Debug logs
  console.log("🔍 MainApp Debug - Current User:", currentUser)
  console.log("🔍 MainApp Debug - User Role:", currentUser?.role)
  console.log("🔍 MainApp Debug - Current View:", currentView)

  useEffect(() => {
    // Load submissions from localStorage
    const savedSubmissions = loadSubmissionsFromLocalStorage()
    setSubmissions(savedSubmissions)

    // Refresh user data from database
    const refreshUserData = async () => {
      try {
        const updatedUser = await getCurrentUser()
        if (updatedUser) {
          console.log("🔄 Refreshed user data:", updatedUser)
          setCurrentUser(updatedUser)
        }
      } catch (error) {
        console.error("🚨 Error refreshing user data:", error)
      }
    }

    refreshUserData()
  }, [])

  const handleSubmissionAdded = (newSubmission: Submission) => {
    const updatedSubmissions = [...submissions, newSubmission]
    setSubmissions(updatedSubmissions)
    saveSubmissionsToLocalStorage(updatedSubmissions)
  }

  const showModalAction = (title: string, messages: string[], type: "error" | "success" = "success") => {
    setModalTitle(title)
    setModalMessages(messages)
    setModalType(type)
    setShowModal(true)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "upload":
        return (
          <UploadFormView
            currentUser={currentUser}
            onSubmissionAddedAction={handleSubmissionAdded}
            showModalAction={showModalAction}
          />
        )
      case "submissions":
        return <SubmissionsView currentUser={currentUser} submissions={submissions} />
      case "users":
        return currentUser.role === "Label Manager" ? <UsersView currentUser={currentUser} /> : null
      case "admin":
        return currentUser.role === "Label Manager" ? <AdminPanelView currentUser={currentUser} /> : null
      case "email":
        return currentUser.role === "Label Manager" ? <EmailCenterView currentUser={currentUser} /> : null
      case "profile":
        return <MyProfileView currentUser={currentUser} />
      case "settings":
        return <SettingsView currentUser={currentUser} />
      default:
        return <SubmissionsView currentUser={currentUser} submissions={submissions} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <CollapsibleSidebar currentUser={currentUser} currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-auto">{renderCurrentView()}</main>

      {/* Modal */}
      <AlertModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        messages={modalMessages}
        type={modalType}
      />

      {/* Notification and Sound Systems */}
      <NotificationSystem />
      <SoundSystem />
    </div>
  )
}
