"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  users_db,
  saveUsersToLocalStorage,
  saveSubmissionsToLocalStorage,
  loadUsersFromLocalStorage,
  loadSubmissionsFromLocalStorage,
} from "@/lib/data"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import {
  Users,
  Music,
  Database,
  Settings,
  Edit,
  Trash2,
  Plus,
  Save,
  Download,
  Upload,
  Search,
  FileDown,
} from "lucide-react"
import { getStatusColor } from "@/lib/utils"

interface AdminPanelViewProps {
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
  currentUser: User
}

export function AdminPanelView({ showModal, currentUser }: AdminPanelViewProps) {
  const [users, setUsers] = useState<User[]>([])
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<Partial<User>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    loadUsersFromLocalStorage()
    setUsers([...users_db])
    setSubmissionsList(loadSubmissionsFromLocalStorage())
  }

  const saveData = () => {
    saveUsersToLocalStorage()
    saveSubmissionsToLocalStorage(submissionsList)
    showModal("Lưu thành công", ["Đã lưu toàn bộ dữ liệu vào localStorage"], "success")
  }

  const exportData = () => {
    const data = {
      users: users_db,
      submissions: submissionsList,
      exportDate: new Date().toISOString(),
      version: "1.0.0-beta",
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `music-hub-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showModal("Xuất dữ liệu", ["Đã tải file backup thành công"], "success")
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.users && data.submissions) {
          users_db.length = 0
          users_db.push(...data.users)
          setUsers([...users_db])
          setSubmissionsList(data.submissions)

          saveUsersToLocalStorage()
          saveSubmissionsToLocalStorage(data.submissions)

          showModal("Nhập dữ liệu", ["Đã khôi phục dữ liệu thành công"], "success")
        } else {
          showModal("Lỗi nhập dữ liệu", ["File không đúng định dạng"], "error")
        }
      } catch (error) {
        showModal("Lỗi nhập dữ liệu", ["Không thể đọc file JSON"], "error")
      }
    }
    reader.readAsText(file)
  }

  const handleUpdateUser = (user: User) => {
    const index = users_db.findIndex((u) => u.username === user.username)
    if (index !== -1) {
      users_db[index] = user
      setUsers([...users_db])
      saveUsersToLocalStorage()
      setEditingUser(null)
      showModal("Cập nhật thành công", [`Đã cập nhật thông tin ${user.fullName || user.username}`], "success")
    }
  }

  const handleDeleteUser = (username: string) => {
    if (username === "admin") {
      showModal("Không thể xóa", ["Không thể xóa tài khoản admin"], "error")
      return
    }

    if (confirm(`Bạn có chắc muốn xóa người dùng ${username}?`)) {
      const index = users_db.findIndex((u) => u.username === username)
      if (index !== -1) {
        users_db.splice(index, 1)
        setUsers([...users_db])
        saveUsersToLocalStorage()
        showModal("Xóa thành công", [`Đã xóa người dùng ${username}`], "success")
      }
    }
  }

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.password || !newUser.role) {
      showModal("Lỗi tạo user", ["Vui lòng điền đầy đủ thông tin bắt buộc"], "error")
      return
    }

    if (users_db.find((u) => u.username === newUser.username)) {
      showModal("Lỗi tạo user", ["Tên đăng nhập đã tồn tại"], "error")
      return
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as "Label Manager" | "Artist",
      fullName: newUser.fullName || "",
      email: newUser.email || "",
      avatar:
        newUser.avatar ||
        `https://placehold.co/100x100/7c3aed/FFFFFF?text=${newUser.username?.substring(0, 2).toUpperCase()}`,
      bio: newUser.bio || "",
      socialLinks: newUser.socialLinks || {},
      isrcCodePrefix: newUser.isrcCodePrefix || "Demo",
      createdAt: new Date().toISOString(),
    }

    users_db.push(user)
    setUsers([...users_db])
    saveUsersToLocalStorage()
    setNewUser({})
    showModal("Tạo thành công", [`Đã tạo người dùng ${user.username}`], "success")
  }

  const downloadSubmissionFile = (submission: Submission, type: "audio" | "image") => {
    // In a real app, this would download the actual file
    // For demo, we'll show a message
    showModal(
      "Tải xuống",
      [`Đang tải ${type === "audio" ? "file nhạc" : "ảnh bìa"} của "${submission.songTitle}"`],
      "success",
    )
  }

  const canEditUser = (user: User) => {
    return currentUser.role === "Label Manager" || currentUser.username === user.username
  }

  return (
    <div className="p-6 font-dosis">
      <h2 className="text-3xl font-dosis-bold text-white mb-6 flex items-center">
        <Settings className="mr-3 text-purple-400" />
        Quản trị hệ thống
      </h2>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="font-dosis-medium">
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="submissions" className="font-dosis-medium">
            Bài hát
          </TabsTrigger>
          <TabsTrigger value="isrc" className="font-dosis-medium">
            ISRC Lookup
          </TabsTrigger>
          <TabsTrigger value="database" className="font-dosis-medium">
            Database
          </TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-dosis-semibold">
                <span className="flex items-center">
                  <Users className="mr-2" />
                  Quản lý người dùng ({users.length})
                </span>
                {currentUser.role === "Label Manager" && (
                  <Button
                    onClick={() => setNewUser({ role: "Nghệ sĩ" })}
                    className="bg-green-600 hover:bg-green-700 font-dosis-medium"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm user
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Create New User Form - Only for Label Manager */}
              {currentUser.role === "Label Manager" && Object.keys(newUser).length > 0 && (
                <Card className="mb-6 bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg font-dosis-semibold">Tạo người dùng mới</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-dosis-medium">Tên đăng nhập *</Label>
                        <Input
                          value={newUser.username || ""}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          placeholder="username"
                          className="font-dosis"
                        />
                      </div>
                      <div>
                        <Label className="font-dosis-medium">Mật khẩu *</Label>
                        <Input
                          type="password"
                          value={newUser.password || ""}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="password"
                          className="font-dosis"
                        />
                      </div>
                      <div>
                        <Label className="font-dosis-medium">Vai trò *</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) =>
                            setNewUser({ ...newUser, role: value as "Label Manager" | "Nghệ sĩ" })
                          }
                        >
                          <SelectTrigger className="font-dosis">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nghệ sĩ" className="font-dosis">
                              Nghệ sĩ
                            </SelectItem>
                            <SelectItem value="Label Manager" className="font-dosis">
                              Label Manager
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-dosis-medium">Họ tên đầy đủ</Label>
                        <Input
                          value={newUser.fullName || ""}
                          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                          placeholder="Họ tên đầy đủ"
                          className="font-dosis"
                        />
                      </div>
                      <div>
                        <Label className="font-dosis-medium">Email</Label>
                        <Input
                          type="email"
                          value={newUser.email || ""}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="email@example.com"
                          className="font-dosis"
                        />
                      </div>
                      <div>
                        <Label className="font-dosis-medium">ISRC Prefix</Label>
                        <Input
                          value={newUser.isrcCodePrefix || ""}
                          onChange={(e) => setNewUser({ ...newUser, isrcCodePrefix: e.target.value.toUpperCase() })}
                          placeholder="DEMO"
                          maxLength={5}
                          className="font-dosis"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700 font-dosis-medium">
                        <Save className="mr-2 h-4 w-4" />
                        Tạo user
                      </Button>
                      <Button variant="outline" onClick={() => setNewUser({})} className="font-dosis-medium">
                        Hủy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Users List */}
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.username} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={
                              user.avatar ||
                              `https://placehold.co/50x50/8b5cf6/FFFFFF?text=${user.username.substring(0, 1).toUpperCase() || "/placeholder.svg"}`
                            }
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-dosis-semibold text-white">{user.fullName || user.username}</h3>
                            <p className="text-gray-400 font-dosis">
                              @{user.username} - {user.role}
                            </p>
                            <p className="text-gray-500 text-sm font-dosis">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {canEditUser(user) && (
                            <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {currentUser.role === "Label Manager" && user.username !== "admin" && (
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.username)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Management */}
        <TabsContent value="submissions" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Music className="mr-2" />
                Quản lý bài hát ({submissionsList.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissionsList.map((submission) => (
                  <Card key={submission.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={submission.imageUrl || "https://placehold.co/50x50/1f2937/4b5563?text=Art"}
                            alt="Cover"
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h3 className="font-dosis-semibold text-white">{submission.songTitle}</h3>
                            <p className="text-gray-400 font-dosis">{submission.artistName}</p>
                            <p className="text-gray-500 text-sm font-dosis">
                              ID: {submission.id} | ISRC: {submission.isrc}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadSubmissionFile(submission, "audio")}
                            className="font-dosis-medium"
                          >
                            <FileDown className="h-4 w-4 mr-1" />
                            Audio
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadSubmissionFile(submission, "image")}
                            className="font-dosis-medium"
                          >
                            <FileDown className="h-4 w-4 mr-1" />
                            Ảnh
                          </Button>
                          <div className="text-right">
                            <p className="text-sm text-gray-400 font-dosis">{submission.submissionDate}</p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-dosis-medium ${getStatusColor(submission.status)}`}
                            >
                              {submission.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ISRC Lookup */}
        <TabsContent value="isrc" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Search className="mr-2" />
                Tìm kiếm ISRC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <iframe
                  src="https://spotify-to-mxm.vercel.app"
                  className="w-full h-full border border-gray-600 rounded-lg"
                  title="ISRC Lookup Tool"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Management */}
        <TabsContent value="database" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Database className="mr-2" />
                Quản lý database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={saveData} className="bg-blue-600 hover:bg-blue-700 font-dosis-medium">
                  <Save className="mr-2 h-4 w-4" />
                  Lưu dữ liệu
                </Button>

                <Button onClick={exportData} className="bg-green-600 hover:bg-green-700 font-dosis-medium">
                  <Download className="mr-2 h-4 w-4" />
                  Xuất backup
                </Button>

                <div>
                  <input type="file" accept=".json" onChange={importData} className="hidden" id="import-file" />
                  <Button
                    onClick={() => document.getElementById("import-file")?.click()}
                    className="bg-orange-600 hover:bg-orange-700 w-full font-dosis-medium"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Nhập backup
                  </Button>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="font-dosis-semibold mb-2">Thống kê database</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 font-dosis">Tổng người dùng:</span>
                    <span className="ml-2 text-white font-dosis-semibold">{users.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-dosis">Tổng bài hát:</span>
                    <span className="ml-2 text-white font-dosis-semibold">{submissionsList.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-dosis">Label managers:</span>
                    <span className="ml-2 text-white font-dosis-semibold">
                      {users.filter((u) => u.role === "Label Manager").length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-dosis">Nghệ sĩ:</span>
                    <span className="ml-2 text-white font-dosis-semibold">
                      {users.filter((u) => u.role === "Nghệ sĩ").length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Default export for compatibility
export default AdminPanelView
