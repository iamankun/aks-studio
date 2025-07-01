"use client"

// Tôi là An Kun
import { useState, useEffect } from "react"
import type { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Shield } from "lucide-react"

export function UsersView() {
  const [usersList, setUsersList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [artistCount, setArtistCount] = useState(0)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        
        // Fetch artists from API
        const response = await fetch('/api/artists')
        const data = await response.json()
        
        if (data.success && data.artists) {
          setUsersList(data.artists)
          setArtistCount(data.count ?? data.artists.length)
        } else {
          console.error('Failed to fetch users:', data.error)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <div className="p-2 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="mr-3 text-purple-400" />
          Quản Lý Người Dùng
        </h2>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm Người Dùng
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : usersList.length}</div>
            <p className="text-xs text-gray-500">Người dùng hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quản Lý Nhãn Hiệu</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersList.filter((u) => u.role === "Label Manager").length}
            </div>
            <p className="text-xs text-gray-500">Người dùng quản trị</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nghệ Sĩ</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usersList.filter((u) => u.role === "Artist").length}
            </div>
            <p className="text-xs text-gray-500">Tài khoản nghệ sĩ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Người Dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usersList.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-gray-600">@{user.username} • {user.email}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">Chỉnh Sửa</Button>
                  <Button variant="destructive" size="sm">Xóa</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// Tôi là An Kun
// Đây là nơi quản lý người dùng
