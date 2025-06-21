"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/sidebar/collapsible-sidebar"
import SubmissionsView from "@/components/views/submissions-view"
import UploadFormView from "@/components/views/upload-form-view"
import UsersView from "@/components/views/users-view"
import { AdminPanelView } from "@/components/views/admin-panel-view"
import { EmailCenterView } from "@/components/views/email-center-view"
import MyProfileView from "@/components/views/my-profile-view"
import SettingsView from "@/components/views/settings-view"
import { Footer } from "@/components/footer"
import { NotificationSystem, type NotificationData } from "@/components/notification-system"
// import { loadSubmissionsFromLocalStorage, saveSubmissionsToLocalStorage } from "@/lib/data" // Không dùng localStorage nữa
import { SuccessAnimation } from "@/components/animations/success-animation"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"

interface MainAppViewProps {
  currentUser: User
  onLogout: () => void
}


export default function MainAppView({ currentUser, onLogout }: MainAppViewProps) {
  const [currentView, setCurrentView] = useState("submissions")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successData, setSuccessData] = useState<{
    artistName: string
    songTitle: string
  }>({ artistName: "", songTitle: "" })

  useEffect(() => {
    // Load submissions on mount from API
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/submissions');
        const result = await response.json();
        if (result.success && result.data) {
          setSubmissions(result.data);
        } else {
          console.error("Failed to load submissions:", result.message);
          showModal("Lỗi tải Submissions", [result.message || "Không thể tải dữ liệu submissions từ server."], "error");
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        showModal("Lỗi kết nối", ["Không thể kết nối đến server để tải submissions."], "error");
      }
    };
    fetchSubmissions();

    // Listener for global notifications
    const handleGlobalNotification = (event: CustomEvent) => {
      const { title, message, type } = event.detail;
      const notification: NotificationData = {
        id: Date.now().toString(),
        type: type || "info",
        title,
        message,
        duration: 5000,
        sound: true,
      };
      setNotifications((prev) => [...prev, notification]);
    };
    window.addEventListener('showGlobalNotification', handleGlobalNotification as EventListener);
    return () => window.removeEventListener('showGlobalNotification', handleGlobalNotification as EventListener);
  }, [])

  const showModal = (title: string, messages: string[], type: "error" | "success" = "error") => {
    const notification: NotificationData = {
      id: Date.now().toString(),
      type: type,
      title,
      message: messages.join(" "),
      duration: 5000,
      sound: true,
    }
    setNotifications((prev) => [...prev, notification])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleSubmissionAdded = (submission: Submission) => {
    const updatedSubmissions = [...submissions, submission]
    setSubmissions(updatedSubmissions)
    // saveSubmissionsToLocalStorage(updatedSubmissions) // Không lưu vào localStorage nữa
    // Thay vào đó, bạn có thể cần một API để POST submission mới lên DB
    // và sau đó fetch lại danh sách hoặc chỉ cần cập nhật UI tạm thời.
    // Ví dụ đơn giản là cập nhật UI:

    // Show success animation with the new submission data
    setSuccessData({
      artistName: submission.artistName,
      songTitle: submission.songTitle,
    })
    setShowSuccessAnimation(true)

    // Hide the animation after 5 seconds
    setTimeout(() => {
      setShowSuccessAnimation(false)
    }, 5000)
  }

  const handleUpdateStatus = (submissionId: string, newStatus: string) => {
    const updatedSubmissions = submissions.map((sub) =>
      sub.id === submissionId ? { ...sub, status: newStatus as SubmissionStatus } : sub
    )
    setSubmissions(updatedSubmissions)
    // saveSubmissionsToLocalStorage(updatedSubmissions) // Không lưu vào localStorage nữa
    // Tương tự, cần API để cập nhật status trong DB.
    // Sau đó có thể fetch lại hoặc cập nhật UI.
    showModal("Cập nhật trạng thái", [`Đã cập nhật trạng thái thành: ${newStatus}`], "success")
  }

  const renderCurrentView = () => {
    const viewType = currentUser.role === "Label Manager" ? "allSubmissions" : "mySubmissions"

    switch (currentView) {
      case "submissions":
        return (
          <SubmissionsView
            submissions={submissions}
            currentUser={currentUser}
            viewType={viewType}
            onUpdateStatus={handleUpdateStatus}
            showModal={showModal}
          />
        )
      case "upload":
        return (
          <UploadFormView currentUser={currentUser} onSubmissionAdded={handleSubmissionAdded} showModal={showModal} />
        )
      case "users":
        return <UsersView />
      case "admin":
        return <AdminPanelView currentUser={currentUser} showModal={showModal} />
      case "email":
        return <EmailCenterView showModal={showModal} />
      case "profile":
        return <MyProfileView currentUser={currentUser} showModal={showModal} />
      case "settings":
        return <SettingsView currentUser={currentUser} />
      default:
        return (
          <SubmissionsView
            submissions={submissions}
            currentUser={currentUser}
            viewType={viewType}
            onUpdateStatus={handleUpdateStatus}
            showModal={showModal}
          />
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 font-dosis">
      <CollapsibleSidebar
        currentUser={currentUser}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={onLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{renderCurrentView()}</main>
        <Footer />
      </div>

      {showSuccessAnimation && (
        <SuccessAnimation
          artistName={successData.artistName}
          songTitle={successData.songTitle}
          onClose={() => setShowSuccessAnimation(false)}
        />
      )}

      <NotificationSystem notifications={notifications} onRemove={removeNotification} />
    </div>
  )
}
