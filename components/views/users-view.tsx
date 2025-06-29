"use client"

// Tôi là An Kun
import { useState, useEffect } from "react"
import type { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { fetchUsersFromClient } from "@/lib/data" // Đổi tên hàm fetch
import { Users, UserPlus } from "lucide-react"

export function UsersView() {
  const [usersList, setUsersList] = useState<User[]>([])
  const [isClient, setIsClient] = useState(false) // State để kiểm tra client-side

  useEffect(() => {
    // Chỉ chạy sau khi component đã được mount trên client
    setIsClient(true)
    fetchUsersFromClient().then((dbUsers) => {
      setUsersList(dbUsers)
    })
  }, [])

  if (!isClient) {
    // Render một placeholder hoặc không gì cả trên server để tránh hydration error
    return null
  }

  return (
    <div className="p-2 md:p-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <Users className="mr-3 text-purple-400" />
        Quản Lý Người Dùng
      </h2>

      <Card className="bg-gray-800 border border-gray-700">
        <CardContent className="p-6">
          <p className="text-gray-400 mb-4">
            Đây là nơi bạn có thể quản lý người dùng. Trong bản demo này, chức năng bị hạn chế.
          </p>

          <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full">
            <UserPlus className="h-5 w-5 mr-2" />
            Thêm người dùng mới (Demo)
          </Button>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-200 mb-4">Danh sách người dùng hiện tại:</h4>
            <div className="space-y-3">
              {usersList.map((user: User) => (
                <div key={user.id} className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg">
                  <img
                    src={user.avatar ?? `/face.png?text=${user.username.substring(0, 1).toUpperCase()}`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                    style={{ aspectRatio: "1/1" }}
                  />
                  <div className="flex-grow">
                    <p className="text-white font-medium">{user.fullName || user.username}</p>
                    <p className="text-gray-400 text-sm">
                      @{user.username} - {user.role}
                    </p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "Label Manager" ? "bg-purple-500 text-white" : "bg-green-500 text-white"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// Tôi là An Kun
// Đây là nơi quản lý người dùng
