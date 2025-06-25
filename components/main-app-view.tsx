"use client"

import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "@/components/sidebar/sidebar"
import { UploadFormView } from "@/components/upload-form-view"
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
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react"

export default function MainAppView() {
  const { user, loading, error, clearError } = useAuth()
  const [currentView, setCurrentView] = useState("upload")
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Auto-retry on network errors
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        clearError()
        setRetryCount((prev) => prev + 1)
        window.location.reload()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, retryCount, clearError])

  // Show loading with timeout
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading AKs Studio...</h3>
            <p className="text-sm text-gray-600 text-center mb-4">Please wait while we set up your dashboard</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error with retry option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-red-900">Connection Error</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                clearError()
                window.location.reload()
              }}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <p className="text-xs text-gray-600 text-center">Retry attempt: {retryCount}/3</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main app content
  return (
    <SystemStatusProvider>
      <div className="flex h-screen bg-gray-100 relative overflow-hidden">
        <DynamicBackground />

        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-y-auto bg-white/80 backdrop-blur-sm">
            {currentView === "upload" && <UploadFormView />}
            {currentView === "submissions" && <SubmissionsView />}
            {currentView === "profile" && <MyProfileView />}
            {currentView === "settings" && <SettingsView />}
            {currentView === "users" && user?.role === "Label Manager" && <UsersView />}
            {currentView === "admin" && user?.role === "Label Manager" && <AdminPanelView />}
            {currentView === "email" && <EmailCenterView />}
          </div>
        </main>

        <NotificationSystem />
        <SoundSystem />
      </div>
    </SystemStatusProvider>
  )
}
