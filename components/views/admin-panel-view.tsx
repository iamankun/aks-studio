// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Database, Users, Settings } from "lucide-react"
import { DebugTools } from "@/components/debug-tools"
import { useAuth } from "@/components/auth-provider"
import type { User } from "@/types/user"
import { logger } from "@/lib/logger"

interface AdminPanelViewProps {
  readonly showModal: (title: string, message: string, type?: "success" | "error") => void
}

export function AdminPanelView({ showModal }: AdminPanelViewProps) {
  const { user: currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Đang tải thông tin</h2>
          <p className="text-gray-500">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== "Label Manager") {
    logger.warn('AdminPanelView: Access denied for non-label manager', {
      component: 'AdminPanelView',
      userId: currentUser.id,
      role: currentUser.role
    })

    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h3>
            <p className="text-gray-500">Only Label Managers can access the Admin Panel</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  logger.info('AdminPanelView: Component rendered', {
    component: 'AdminPanelView',
    userId: currentUser.id
  })

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
        <Shield className="mr-3 text-purple-400" />
        Admin Panel
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-yellow-600">Demo Mode</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-green-600">Running</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <DebugTools />
      </div>
    </div>
  )
}
// All JSX and logic below this line should be moved inside the AdminPanelView function above, or into their own components as needed.
// Remove this code block from the global scope to prevent errors.
