// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { useAuth } from "@/components/auth-provider"
import { TopNavBar } from "@/components/top-nav-bar"
import { DashboardView } from "@/components/views/dashboard-view"
import UploadFormView from "@/components/views/upload-form-view"
import { SubmissionsView } from "@/components/views/submissions-view"
import { MyProfileView } from "@/components/views/my-profile-view"
import { SettingsView } from "@/components/views/settings-view"
import { UsersView } from "@/components/views/users-view"
import { AdminPanelView } from "@/components/views/admin-panel-view"
import { EmailCenterView } from "@/components/views/email-center-view"
import { DynamicBackground } from "@/components/dynamic-background"
import { NotificationSystem } from "@/components/notification-system"
import { SoundSystem } from "@/components/sound-system"
import { SystemStatusProvider } from "@/components/system-status-provider"
import { AuthFlowClient } from "@/components/auth-flow-client"
import { useState, useEffect } from "react"
import { dbService } from "@/lib/database-service"
import type { Submission } from "@/types/submission"
import { LogsView } from "@/components/views/logs-view"
import { logger } from "@/lib/logger"

export default function MainAppView() {
  const { user, loading, login } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    logger.info('MainAppView: Component mounted', {
      component: 'MainAppView',
      action: 'mount'
    })

    // Đánh dấu đã khởi tạo sau khi component mount
    setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    if (user) {
      logger.info('MainAppView: User logged in', {
        userId: user.id,
        username: user.username,
        role: user.role,
        component: 'MainAppView'
      })
      loadSubmissions()
    }
  }, [user])

  const loadSubmissions = async () => {
    if (!user) return

    logger.debug('MainAppView: Loading submissions', {
      userId: user.id,
      component: 'MainAppView',
      action: 'loadSubmissions'
    })

    try {
      const result = await dbService.getSubmissions({
        username: user.role === "Label Manager" ? undefined : user.username
      })

      if (result.success && result.data) {
        setSubmissions(result.data)
        logger.info('MainAppView: Submissions loaded successfully', {
          count: result.data.length,
          userId: user.id,
          component: 'MainAppView'
        })
      }
    } catch (error) {
      logger.error('MainAppView: Failed to load submissions', error, {
        userId: user.id,
        component: 'MainAppView',
        action: 'loadSubmissions'
      })
    }
  }

  const handleSubmissionAdded = async (submission: Submission) => {
    try {
      const result = await dbService.createSubmission(submission)
      if (result.success) {
        setSubmissions(prev => [submission, ...prev])
        showNotification("Thành công", "Đã gửi submission thành công!", "success")
      }
    } catch (error) {
      console.error("Failed to add submission:", error)
      showNotification("Lỗi", "Không thể gửi submission", "error")
    }
  }

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    try {
      const result = await dbService.updateSubmissionStatus(submissionId, newStatus)
      if (result.success) {
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId ? { ...sub, status: newStatus as any } : sub
          )
        )
        showNotification("Cập nhật", "Đã cập nhật trạng thái", "success")
      }
    } catch (error) {
      console.error("Failed to update status:", error)
      showNotification("Lỗi", "Không thể cập nhật trạng thái", "error")
    }
  }

  const removeNotificationById = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const showNotification = (title: string, messages: string[] | string, type: "success" | "error" = "success") => {
    const message = Array.isArray(messages) ? messages.join(', ') : messages;
    const notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date()
    }
    setNotifications(prev => [notification, ...prev])

    // Auto remove after 5 seconds
    setTimeout(() => removeNotificationById(notification.id), 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Always render the main layout, but overlay loading/login if needed
  let overlay: React.ReactNode = null;

  // Chỉ hiển thị overlay khi thực sự cần và đã initialized
  if (!isInitialized || loading) {
    overlay = (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Đang tải...</div>
          <div className="text-white/70 text-sm mt-2">AKs Studio Digital Music</div>
        </div>
      </div>
    );
  } else if (!user && isInitialized) {
    const handleLogin = async (username: string, password: string) => {
      const success = await login(username, password)
      return {
        success,
        message: success ? "Đăng nhập thành công" : "Đăng nhập thất bại"
      }
    }
    overlay = (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">AKs Studio</h1>
            <p className="text-white/70">Digital Music Distribution</p>
          </div>
          <AuthFlowClient onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  // Debug UI: show user, loading, currentView in sidebar for troubleshooting
  return (
    <SystemStatusProvider>
      <div className="flex h-screen bg-background relative overflow-hidden">
        <DynamicBackground />
        <TopNavBar currentView={currentView} onViewChange={setCurrentView} />
        <div className="w-full"> {/* Full width container, no sidebar */}
          <main className="flex-1 overflow-hidden relative">
            <div className="h-full overflow-y-auto bg-background transition-colors duration-300">
              {/* Main Content Views */}
              {currentView === "dashboard" && <DashboardView />}
              {currentView === "upload" && (
                <UploadFormView
                  onSubmissionAdded={handleSubmissionAdded}
                  showModal={showNotification}
                />
              )}
              {currentView === "submissions" && (
                <SubmissionsView
                  submissions={submissions}
                  viewType="all"
                  onUpdateStatus={handleStatusUpdate}
                  showModal={showNotification}
                />
              )}
              {currentView === "profile" && (
                <MyProfileView
                  showModal={showNotification}
                />
              )}
              {currentView === "settings" && (
                <SettingsView />
              )}
              {currentView === "users" && user?.role === "Label Manager" && (
                <UsersView />
              )}
              {currentView === "admin" && user?.role === "Label Manager" && (
                <AdminPanelView
                  showModal={showNotification}
                />
              )}
              {currentView === "email" && (
                <EmailCenterView
                  showModal={showNotification}
                />
              )}
              {currentView === "logs" && user?.role === "Label Manager" && (
                <LogsView />
              )}
            </div>
          </main>
        </div>
        <NotificationSystem notifications={notifications} onRemove={removeNotification} />
        <SoundSystem />
        {overlay}
      </div>
    </SystemStatusProvider>
  )
}
