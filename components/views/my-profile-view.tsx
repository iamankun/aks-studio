import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Shield, Copy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"

interface MyProfileViewProps {
  showModal: (title: string, message: string, type?: "success" | "error") => void
}

export function MyProfileView({ showModal }: MyProfileViewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: currentUser, login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    bio: "",
    socialLinks: {
      facebook: "",
      youtube: "",
      spotify: "",
      appleMusic: "",
      tiktok: "",
      instagram: "",
    },
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("/face.png");

  // Initialize form data when user data is available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
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
      });
      setAvatarPreview(currentUser.avatar || "/face.png");
    }
  }, [currentUser]);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Chỉ validate loại file, không giới hạn kích thước
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        showModal("Lỗi Tải Ảnh", "Chỉ nhận JPG/PNG.")
        e.target.value = ""
        return
      }

      setAvatarFile(file)
      // Hiển thị thông báo đang xử lý
      setIsModalOpen(true)
      showModal("Đang Xử Lý", "Đang tải và xử lý ảnh đại diện...")

      // Gửi file lên API avatar
      const form = new FormData()
      console.log("Uploading avatar file:", file.name, file.type, file.size);
      form.append("file", file)
      form.append("artistName", currentUser.username || 'default-user')
      form.append("userId", currentUser.id || 'default-id')
      form.append("role", currentUser.role || 'Artist') // Thêm role để xác định bảng

      try {
        // Show loading state
        showModal("Đang xử lý", "Đang tải ảnh lên, vui lòng đợi...")

        console.log("Sending request to /api/upload/avatar");
        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          body: form
        })

        console.log("Response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API error response:", errorText);
          throw new Error(`HTTP error ${res.status}: ${errorText}`);
        }

        const data = await res.json()
        console.log("API response:", data);

        if (data.success && data.url) {
          console.log("Upload successful. URL:", data.url);
          setAvatarPreview(data.url)
          setFormData((prev) => ({ ...prev, avatar: data.url }))

          // Đóng modal thông báo
          setIsModalOpen(false)
          showModal("Thành công", "Ảnh đại diện đã được cập nhật", "success")

          // Cập nhật lại user context bằng cách gọi lại login (nếu cần, hoặc reload user info)
          if (currentUser) {
            await login(currentUser.username, "") // password rỗng, backend nên bỏ qua check nếu đã login
          }
        } else {
          console.error("Upload failed:", data);
          showModal("Lỗi Upload", data.message || "Không upload được ảnh đại diện!")
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Detailed error:", error);
        showModal("Lỗi Upload", `Không thể kết nối server: ${errorMessage}`)
      }
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
      showModal("Copy Thành Công", `Đã copy link ${platform}: ${link}`, "success")
    } catch (err: any) {
      console.error("Clipboard copy failed:", err);
      showModal("Lỗi Copy", "Không thể copy link vào clipboard.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Update profile via API instead of localStorage
      const updateData = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        bio: formData.bio,
        socialLinks: formData.socialLinks,
        avatar: avatarPreview
      }

      // In production, this would call a real API endpoint
      // For now, just show success message
      showModal("Thành Công", "Cập nhật profile thành công! (Demo mode - changes not saved)")

    } catch (error) {
      console.error('Error updating profile:', error)
      showModal("Lỗi Cập Nhật", "Có lỗi xảy ra khi cập nhật profile")
    }
  }

  return (
    <div className="p-2 md:p-6">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <User className="mr-3 text-purple-400" />
        Hồ sơ nghệ sĩ của tôi
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
                  <Label htmlFor="avatarFile">Ảnh đại diện (JPG/PNG, tự động crop về 1:1)</Label>
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
                            onClick={() => handleCopyLink(link ?? "", platform)}
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
                  <User className="h-5 w-5 mr-2" />
                  Lưu Thay Đổi
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{currentUser.fullName}</h3>
                  <p className="text-gray-600">@{currentUser.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{currentUser.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{currentUser.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Tham gia từ {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
