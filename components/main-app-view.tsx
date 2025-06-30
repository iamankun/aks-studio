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
import { useState, useEffect, useCallback } from "react"
import { databaseService } from "@/lib/database-service"
import type { Submission, SubmissionStatus } from "@/types/submission"
import { LogsView } from "@/components/views/logs-view"
import { logger } from "@/lib/logger"

export default function MainAppView() {
  const { user, loading, login } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "success" | "error";
    timestamp: Date;
  }>>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const loadSubmissions = useCallback(async () => {
    if (!user) return

    logger.debug('MainAppView: Loading submissions', {
      userId: user.id,
      component: 'MainAppView',
      action: 'loadSubmissions'
    })

    try {
      const result = await databaseService.getSubmissions({
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
  }, [user])

  useEffect(() => {
    logger.info('MainAppView: Component mounted', {
      component: 'MainAppView',
      action: 'mount'
    })

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
  }, [user, loadSubmissions])

  const handleSubmissionAdded = async (submission: Submission) => {
    try {
      const result = await databaseService.saveSubmission(submission)
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
      const result = await databaseService.updateSubmissionStatus(submissionId, newStatus as SubmissionStatus)
      if (result.success) {
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId ? { ...sub, status: newStatus as SubmissionStatus } : sub
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

    setTimeout(() => removeNotificationById(notification.id), 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  let overlay: React.ReactNode = null;

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

  return (
    <SystemStatusProvider>
      <div className="flex min-h-screen bg-background relative main-container">
        <DynamicBackground />
        <TopNavBar currentView={currentView} onViewChange={setCurrentView} />
        <div className="w-full min-h-screen">
          <main className="flex-1 relative pt-20 min-h-screen">
            <div className="min-h-screen bg-background transition-colors duration-300 pb-8">
              {currentView === "dashboard" && <DashboardView onViewChange={setCurrentView} />}
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
                  onViewChange={setCurrentView}
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
