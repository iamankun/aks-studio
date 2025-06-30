// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Database, Users, Settings, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { DebugTools } from "@/components/debug-tools"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import { logger } from "@/lib/logger"

interface AdminPanelViewProps {
  readonly showModal: (title: string, message: string, type?: "success" | "error") => void
}

interface SystemStats {
  database: { connected: boolean; type: string }
  users: { totalArtists: number; totalManagers: number; activeUsers: number }
  content: { totalSubmissions: number; pendingSubmissions: number; approvedSubmissions: number }
  system: { uptime: number; memory: any; version: string; environment: string }
}

export function AdminPanelView({ showModal }: AdminPanelViewProps) {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'submissions'>('overview')
  const [users, setUsers] = useState<User[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()

        if (data.success) {
          setStats(data.data)
        } else {
          console.error('Failed to fetch admin stats:', data.error)
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.role === "Label Manager") {
      fetchStats()
    }
  }, [currentUser])

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
              <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${loading ? 'bg-gray-400' :
                  stats?.database.connected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              <p className={`text-sm ${loading ? 'text-gray-600' :
                  stats?.database.connected ? 'text-green-600' : 'text-red-600'
                }`}>
                {loading ? 'Checking...' :
                  stats?.database.connected ? `Connected (${stats.database.type})` : 'Disconnected'}
              </p>
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
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.users.totalArtists ?? 0}
              </div>
              <p className="text-sm text-gray-600">Active Artists</p>
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
              <div className="text-lg font-bold">
                {loading ? '...' : stats?.system.version ?? 'Unknown'}
              </div>
              <p className="text-sm text-gray-600">
                {loading ? 'Loading...' : stats?.system.environment ?? 'Unknown'}
              </p>
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
