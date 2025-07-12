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
import { useState, useEffect, useCallback } from "react"
import type { Submission, SubmissionStatus } from "@/types/submission"
import { LogsView } from "@/components/views/logs-view"
import { logger } from "@/lib/logger"

export default function MainAppView() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState("dashboard")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: "success" | "error";
    timestamp: Date;
  }>>([])

  const loadSubmissions = useCallback(async () => {
    if (!user) return

    logger.debug('MainAppView: Loading submissions', {
      userId: user.id,
      component: 'MainAppView',
      action: 'loadSubmissions'
    })

    try {
      // Lấy submissions từ API Next.js (truy vấn trực tiếp database)
      const response = await fetch('/api/submissions')
      const result = await response.json()

      // Chuẩn hóa cho cả trường hợp result.data hoặc result.submissions
      const data = result.data ?? result.submissions ?? [];
      setSubmissions(data)
      logger.info('MainAppView: Submissions loaded successfully', {
        count: data.length,
        userId: user.id,
        component: 'MainAppView'
      })
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
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      })
      const result = await response.json()
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
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const result = await response.json()
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
    // Generate a unique ID using timestamp + random string
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const notification = {
      id: uniqueId,
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

  // Logic hiển thị overlay và form đăng nhập đã được chuyển qua AuthProvider
  // MainAppView giờ chỉ cần render khi có user

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
      </div>
    </SystemStatusProvider>
  )
}
