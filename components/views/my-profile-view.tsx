"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import type { User } from "@/types/user"
import { users_db, saveUsersToLocalStorage } from "@/lib/data"
import { UserCircle, Copy, Sparkles } from "lucide-react"

interface MyProfileViewProps {
  currentUser: User
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
}

export default function MyProfileView({ currentUser, showModal }: MyProfileViewProps) {
  const [formData, setFormData] = useState({
    username: currentUser.username,
    fullName: currentUser.fullName || "",
    email: currentUser.email || "",
    bio: currentUser.bio || "",
    socialLinks: {
      facebook: currentUser.socialLinks?.facebook || "",
      youtube: currentUser.socialLinks?.youtube || "",
      spotify: currentUser.socialLinks?.spotify || "",
      appleMusic: currentUser.socialLinks?.appleMusic || "",
      tiktok: currentUser.socialLinks?.tiktok || "",
      instagram: currentUser.socialLinks?.instagram || "",
    },
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(
    currentUser.avatar || "https://placehold.co/150x150/1f2937/4b5563?text=Avatar",
  )

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("socialLinks.")) {
      const socialField = field.replace("socialLinks.", "")
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showModal("Lỗi Tải Ảnh", ["Ảnh đại diện max 2MB."])
        e.target.value = ""
        return
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        showModal("Lỗi Tải Ảnh", ["Chỉ nhận JPG/PNG."])
        e.target.value = ""
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSuggestBio = () => {
    const suggestedBios = [
      `Là một ${currentUser.role} tài năng, ${formData.fullName || currentUser.username} luôn mang đến những làn gió mới cho âm nhạc Việt.`,
      `Với đam mê cháy bỏng, ${formData.fullName || currentUser.username} đang từng bước khẳng định vị trí của mình. #GenZMusic`,
      `Âm nhạc của ${formData.fullName || currentUser.username} là sự kết hợp độc đáo giữa truyền thống và hiện đại, chạm đến cảm xúc người nghe.`,
      `${formData.fullName || currentUser.username} - nghệ sĩ GenZ với phong cách riêng biệt, luôn tìm tòi và sáng tạo trong từng giai điệu.`,
      `Từ những beat chill đến những bản ballad sâu lắng, ${formData.fullName || currentUser.username} chinh phục trái tim người nghe bằng âm nhạc chân thành.`,
    ]

    const randomBio = suggestedBios[Math.floor(Math.random() * suggestedBios.length)]
    setFormData((prev) => ({ ...prev, bio: randomBio }))
    showModal("Gợi Ý Bio", ["Đã có bio mẫu! Bạn có thể chỉnh sửa thêm nhé!"], "success")
  }

  const handleCopyLink = async (link: string, platform: string) => {
    if (!link) {
      showModal("Chưa có Link", ["Vui lòng nhập link trước khi copy."], "error")
      return
    }

    try {
      await navigator.clipboard.writeText(link)
      showModal("Copy Thành Công", [`Đã copy link ${platform}: ${link}`], "success")
    } catch (err) {
      showModal("Lỗi Copy", ["Không thể copy link vào clipboard."])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const userIndex = users_db.findIndex((u) => u.username === currentUser.username)
    if (userIndex === -1) {
      showModal("Lỗi Cập Nhật", ["Không tìm thấy người dùng."])
      return
    }

    // Update user data
    users_db[userIndex] = {
      ...users_db[userIndex],
      fullName: formData.fullName,
      email: formData.email,
      bio: formData.bio,
      avatar: avatarFile ? avatarPreview : users_db[userIndex].avatar,
      socialLinks: formData.socialLinks,
    }

    // Update current user in session
    const updatedUser = users_db[userIndex]
    sessionStorage.setItem("currentUser", JSON.stringify(updatedUser))

    // Save to localStorage
    saveUsersToLocalStorage()

    showModal("Thành công", ["Nghệ sĩ đã được cập nhật!"], "success")
  }

  return (
    <div className="p-2 md:p-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <UserCircle className="mr-3 text-purple-400" />
        Hồ sơ nghệ sĩ của tôi
      </h2>

      <Card className="bg-gray-800 border border-gray-700 max-w-2xl mx-auto">
        <CardContent className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                value={formData.username}
                readOnly
                className="rounded-xl mt-1 bg-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <Label htmlFor="fullName">
                Họ Tên Đầy Đủ<span className="text-red-500 font-bold ml-0.5">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="rounded-xl mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email<span className="text-red-500 font-bold ml-0.5">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="rounded-xl mt-1"
              />
            </div>

            <div>
              <Label htmlFor="avatarFile">Ảnh đại diện (4000x4000px, JPG/PNG, max 2MB)</Label>
              <Input
                id="avatarFile"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleAvatarChange}
                className="mt-1"
              />
              <img
                src={avatarPreview || "/placeholder.svg"}
                alt="Avatar Preview"
                className="mt-3 rounded-full w-32 h-32 object-cover border-2 border-gray-600 mx-auto"
                style={{ aspectRatio: "1/1" }}
              />
            </div>

            <div>
              <Label htmlFor="bio">Tiểu sử nghệ sĩ</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={5}
                className="rounded-xl mt-1"
                placeholder="Giới thiệu nghệ sĩ"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSuggestBio}
                className="mt-2 rounded-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Gợi Ý Bio
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 pt-4 border-t border-gray-600 mb-4">
                Liên kết mạng xã hội
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.socialLinks).map(([platform, link]) => (
                  <div key={platform}>
                    <Label className="block text-xs font-medium text-gray-400 mb-1 capitalize">
                      {platform === "appleMusic" ? "Apple Music" : platform}
                    </Label>
                    <div className="flex">
                      <Input
                        value={link}
                        onChange={(e) => handleInputChange(`socialLinks.${platform}`, e.target.value)}
                        className="rounded-xl rounded-r-none flex-grow"
                        placeholder={`https://${platform}.com/...`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleCopyLink(link, platform)}
                        className="rounded-xl rounded-l-none border-l-0 px-3"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">🔔 Test Notification System</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => showModal("Profile Test", ["Profile notification with musical sound!"], "success")}
                  className="text-sm"
                >
                  🎵 Success Sound
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => showModal("Error Test", ["Error notification with alert sound!"], "error")}
                  className="text-sm"
                >
                  🚨 Error Sound
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full bg-green-600 hover:bg-green-700 py-6">
              <UserCircle className="h-5 w-5 mr-2" />
              Lưu Thay Đổi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
