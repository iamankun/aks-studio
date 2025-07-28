// Enhanced Admin Panel View with CRUD operations
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Database, Users, Settings, Edit, Trash2, RefreshCw, Plus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"

interface AdminPanelViewProps {
  readonly showModal: (title: string, message: string, type?: "success" | "error") => void
}

interface SystemStats {
  database: { connected: boolean; type: string }
  users: { totalArtists: number; totalManagers: number; activeUsers: number }
  content: { totalSubmissions: number; pendingSubmissions: number; approvedSubmissions: number }
  system: { uptime: number; memory: Record<string, number>; version: string; environment: string }
}

// @ts-ignore
export function AdminPanelView({showModal: showModal}: AdminPanelViewProps) {
  const type = useAuth();
  const { user: currentUser } = type;
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
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (currentUser?.role === "Label Manager") {
      fetchStats()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/artists')
      const data = await response.json()
      if (data.success) {
        setUsers(data.artists)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true)
    try {
      const response = await fetch('/api/submissions')
      const data = await response.json()
      if (data.success) {
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setSubmissionsLoading(false)
    }
  }

  const deleteSubmission = async (id: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setSubmissions(prev => prev.filter(s => s.id !== id))
        showModal("Thành công", "Đã xóa submission thành công", "success")
      } else {
        showModal("Lỗi", data.message ?? "Không thể xóa submission", "error")
      }
    } catch (error) {
      console.error("Error deleting submission:", error)
      showModal("Lỗi", "Đã xảy ra lỗi khi xóa submission", "error")
    }
  }

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (data.success) {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
        showModal("Thành công", "Đã cập nhật trạng thái", "success")
      }
    } catch (error) {
      showModal("Lỗi", "Không thể cập nhật", "error")
    }
  }

  if (!currentUser) {
    return <div className="p-6 text-center">Đang tải...</div>
  }

  if (currentUser.role !== "Label Manager") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-red-600">Truy cập bị từ chối</h2>
        <p>Chỉ Label Manager mới có quyền truy cập trang này.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={() => setActiveTab('overview')}
          variant={activeTab === 'overview' ? 'default' : 'outline'}
        >
          <Shield className="mr-2 h-4 w-4" />
          Tổng quan
        </Button>
        <Button 
          onClick={() => {setActiveTab('users'); fetchUsers()}}
          variant={activeTab === 'users' ? 'default' : 'outline'}
        >
          <Users className="mr-2 h-4 w-4" />
          Quản lý Users ({users.length})
        </Button>
        <Button 
          onClick={() => {setActiveTab('submissions'); fetchSubmissions()}}
          variant={activeTab === 'submissions' ? 'default' : 'outline'}
        >
          <Edit className="mr-2 h-4 w-4" />
          Quản lý Submissions ({submissions.length})
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.database.connected ? '✅' : '❌'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.database.connected ? `Connected (${stats.database.type})` : 'Disconnected'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Artists</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.users.totalArtists ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active: {loading ? '...' : stats?.users.activeUsers ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submissions</CardTitle>
              <Edit className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.content.totalSubmissions ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending: {loading ? '...' : stats?.content.pendingSubmissions ?? 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System</CardTitle>
              <Settings className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats?.system.version ?? 'Unknown'}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : stats?.system.environment ?? 'Unknown'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quản lý Users</span>
              <Button onClick={fetchUsers} disabled={usersLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {usersLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">Đang tải users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">Không có users nào</div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-semibold">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                      <p className="text-xs text-gray-500">{user.bio}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submissions Management Tab */}
      {activeTab === 'submissions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quản lý Submissions</span>
              <Button onClick={fetchSubmissions} disabled={submissionsLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                {submissionsLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="text-center py-8">Đang tải submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">Không có submissions nào</div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h3 className="font-semibold">{submission.track_title}</h3>
                      <p className="text-sm text-gray-600">Artist: {submission.artist_username}</p>
                      <p className="text-xs text-gray-500">
                        Status: <span className={`px-2 py-1 rounded text-xs ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {submission.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={submission.status} 
                        onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <Button size="sm" variant="destructive" onClick={() => deleteSubmission(submission.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
