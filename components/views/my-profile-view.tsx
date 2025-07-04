import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { User, Mail, Calendar, Shield, Copy, Sparkles } from "lucide-react"
import { AwesomeIcon } from "@/components/ui/awesome-icon"
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
  const { user: currentUser, login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    bio: "",
    avatar: "",
    socialLinks: {
      facebook: "",
      youtube: "",
      spotify: "",
      appleMusic: "",
      tiktok: "",
      instagram: "",
    },
  });
  // No need to store the File object since we're uploading immediately
  const [avatarPreview, setAvatarPreview] = useState("/face.png");

  // Initialize form data when user data is available
  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || "/face.png",
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
      // Sử dụng normalizeInputValues để chuẩn hóa giá trị social links
      const normalizedValue = normalizeInputValues(socialField, value)
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: normalizedValue,
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

      // Hiển thị thông báo đang xử lý
      showModal("Đang Xử Lý", "Đang tải và xử lý ảnh đại diện...")

      // Gửi file lên API avatar
      const form = new FormData()
      form.append("file", file)
      form.append("artistName", currentUser.username || 'default-user')
      form.append("userId", currentUser.id || 'default-id')
      form.append("role", currentUser.role || 'Artist') // Thêm role để xác định bảng

      try {
        // Show loading state
        showModal("Đang xử lý", "Đang tải ảnh lên, vui lòng đợi...")

        const res = await fetch("/api/upload/avatar", {
          method: "POST",
          body: form
        })

        if (!res.ok) {
          const errorText = await res.text();
          console.error("API error response:", errorText);
          throw new Error(`HTTP error ${res.status}: ${errorText}`);
        }

        const data = await res.json()

        if (data.success && data.url) {
          // Cập nhật cả state preview và formData
          setAvatarPreview(data.url)
          setFormData(prev => ({ ...prev, avatar: data.url }))

          // Hiển thị thông báo thành công
          showModal("Thành công", "Ảnh đại diện đã được cập nhật", "success")

          // Cập nhật lại user context bằng cách gọi lại login (nếu cần, hoặc reload user info)
          if (currentUser) {
            await login(currentUser.username, "") // password rỗng, backend nên bỏ qua check nếu đã login
          }
        } else {
          console.error("Upload failed:", data);
          showModal("Lỗi Upload", data.message ?? "Không upload được ảnh đại diện!")
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
    showModal("Gợi Ý Bio", "Đã có bio mẫu! Bạn có thể chỉnh sửa thêm nhé!", "success")
  }

  const handleCopyLink = async (link: string, platform: string) => {
    if (!link) {
      showModal("Chưa có Link", "Vui lòng nhập link trước khi copy.", "error")
      return
    }

    try {
      await navigator.clipboard.writeText(link)
      showModal("Copy Thành Công", `Đã copy link ${platform}: ${link}`, "success")
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      showModal("Lỗi Copy", "Không thể copy link vào clipboard.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      showModal("Đang xử lý", "Đang cập nhật thông tin profile...")

      // Tạo data để gửi lên API (kèm theo thông tin avatar)
      const updatedProfile = {
        ...formData,
        id: currentUser.id,
        username: currentUser.username,
        role: currentUser.role,
        table: currentUser.role === "Label Manager" ? "label_manager" : "artist",
        // Nếu formData.avatar không có, sử dụng avatarPreview nếu khác với mặc định
        avatar: formData.avatar || (avatarPreview !== "/face.png" ? avatarPreview : currentUser.avatar),
        // Đảm bảo socialLinks chỉ có giá trị không rỗng
        socialLinks: Object.fromEntries(
          Object.entries(formData.socialLinks).filter(([, value]) => value.trim() !== "")
        )
      }

      console.log("Gửi dữ liệu cập nhật profile:", updatedProfile)

      // Gọi API để cập nhật thông tin
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Cập nhật lại user context bằng dữ liệu trả về từ API
        if (result.user) {
          // Cập nhật thông tin user trong localStorage
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updatedUser = {
            ...currentUser,
            fullName: result.user.fullName || currentUser.fullName,
            email: result.user.email || currentUser.email,
            bio: result.user.bio || currentUser.bio,
            avatar: result.user.avatar || currentUser.avatar,
            socialLinks: result.user.socialLinks || currentUser.socialLinks
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));

          // Cập nhật lại user context bằng cách reload trang
          // Đây là giải pháp tạm thời, cách tốt hơn là cập nhật context trực tiếp
          window.location.reload();
        }

        showModal("Thành Công", "Đã cập nhật profile thành công!", "success")
      } else {
        throw new Error(result.message || "Cập nhật không thành công")
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định"
      showModal("Lỗi Cập Nhật", `Có lỗi xảy ra khi cập nhật profile: ${errorMessage}`, "error")
    }
  }

  // Hàm để chuẩn hóa các giá trị social links trước khi lưu
  const normalizeInputValues = (platform: string, value: string) => {
    // Nếu giá trị rỗng, trả về chuỗi rỗng
    if (!value.trim()) return "";

    // Chuẩn hóa giá trị dựa trên nền tảng
    switch (platform) {
      case 'facebook':
      case 'instagram':
        // Xóa @ và các ký tự đặc biệt không cần thiết
        return value.replace('@', '').trim();
      case 'youtube':
      case 'tiktok':
        // Bảo toàn @ nếu có, nếu không thêm vào
        if (value.startsWith('@')) return value.trim();
        return `@${value.trim()}`;
      case 'spotify':
      case 'appleMusic':
        // Chỉ lấy phần ID, xóa URL nếu có
        if (value.includes('/')) {
          const parts = value.split('/');
          return parts[parts.length - 1].trim();
        }
        return value.trim();
      default:
        return value.trim();
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
                    Họ tên đầy đủ<span className="text-red-500 font-bold ml-0.5">*</span>
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
                  <div className="mt-3 rounded-full w-32 h-32 border-2 border-gray-600 mx-auto overflow-hidden">
                    <Image
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar Preview"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      style={{ aspectRatio: "1/1" }}
                    />
                  </div>
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
                            placeholder={
                              platform === 'facebook' ? 'iamankun' :
                                platform === 'youtube' ? '@ankun_music' :
                                  platform === 'spotify' ? '5NIqsUlRfxkY4d2WjhcmXs' :
                                    platform === 'appleMusic' ? '1545463988' :
                                      platform === 'tiktok' ? '@iamankun' :
                                        platform === 'instagram' ? 'iamankun' :
                                          `https://${platform}.com/...`
                            }
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
                      onClick={() => showModal("Profile Test", "Profile notification with musical sound!", "success")}
                      className="text-sm"
                    >
                      🎵 Success Sound
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => showModal("Error Test", "Error notification with alert sound!", "error")}
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
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-b from-gray-800 to-gray-900">
            <div className="relative h-32 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-900 shadow-xl animate-pulse-slow">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={currentUser.fullName ?? currentUser.username}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      priority
                      onError={(e) => {
                        e.currentTarget.src = "/face.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <CardContent className="mt-20 space-y-4 text-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center justify-center">
                  {formData.fullName || currentUser.fullName}
                  {/* Show verified badge if artist has YouTube, Spotify, or Apple Music */}
                  {(formData.socialLinks.youtube ||
                    formData.socialLinks.spotify ||
                    formData.socialLinks.appleMusic) && (
                      <span className="ml-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center shadow-md" title="Nghệ sĩ đã xác thực">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                </h2>
                <p className="text-gray-400 text-lg mt-1">@{currentUser.username}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{currentUser.role}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 col-span-full">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Tham gia từ {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Label Admin Controls for Verification - Only visible for Label Manager role */}
              {(currentUser.role === 'Label Manager') && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Label Management Controls</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/40 hover:to-green-600/40 text-green-400"
                      onClick={() => {
                        // In a real app, this would call an API to grant verification
                        // For demo purposes, just show a modal
                        showModal("Cấp Tích Xanh", "Đã cấp tích xanh cho nghệ sĩ thành công!", "success")
                      }}
                    >
                      <AwesomeIcon icon="fa-check-circle" solid className="mr-2" />
                      Cấp Tích Xanh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/40 hover:to-red-600/40 text-red-400"
                      onClick={() => {
                        // In a real app, this would call an API to remove verification
                        // For demo purposes, just show a modal
                        showModal("Hủy Tích Xanh", "Đã hủy tích xanh của nghệ sĩ thành công!", "success")
                      }}
                    >
                      <AwesomeIcon icon="fa-times-circle" solid className="mr-2" />
                      Hủy Tích Xanh
                    </Button>
                  </div>
                </div>
              )}

              {/* Social Media Links - Enhanced with icons */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Kết nối mạng xã hội</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(formData.socialLinks).map(([platform, value]) => {
                    if (!value) return null;

                    let url = '';
                    let icon = null;

                    switch (platform) {
                      case 'facebook':
                        url = `https://www.facebook.com/${value.replace('@', '')}`;
                        icon = <AwesomeIcon icon="fa-facebook" brands size="lg" className="text-blue-600" />;
                        break;
                      case 'youtube':
                        // Handle formats with @
                        url = value.startsWith('@')
                          ? `https://www.youtube.com/${value}`
                          : `https://www.youtube.com/@${value}`;
                        icon = <AwesomeIcon icon="fa-youtube" brands size="lg" className="text-red-600" />;
                        break;
                      case 'tiktok':
                        // Handle formats with @
                        url = value.startsWith('@')
                          ? `https://www.tiktok.com/${value}`
                          : `https://www.tiktok.com/@${value}`;
                        icon = <AwesomeIcon icon="fa-tiktok" brands size="lg" className="text-black dark:text-white" />;
                        break;
                      case 'instagram':
                        url = `https://www.instagram.com/${value.replace('@', '')}`;
                        icon = <AwesomeIcon icon="fa-instagram" brands size="lg" className="text-pink-600" />;
                        break;
                      case 'spotify':
                        // Direct to artist page with ID
                        url = `https://open.spotify.com/artist/${value}`;
                        icon = <AwesomeIcon icon="fa-spotify" brands size="lg" className="text-green-600" />;
                        break;
                      case 'appleMusic':
                        // Direct to artist page with ID
                        url = `https://music.apple.com/artist/${value}`;
                        icon = <AwesomeIcon icon="fa-apple" brands size="lg" className="text-gray-700 dark:text-gray-300" />;
                        break;
                      default:
                        url = value;
                        icon = <AwesomeIcon icon="fa-link" solid size="lg" className="text-gray-600" />;
                    }

                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full px-3 py-2 bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm hover:from-gray-600 hover:to-gray-700 hover:shadow-lg transition-all duration-300"
                      >
                        <span className="mr-2">{icon}</span>
                        <span className="text-xs">{platform === "appleMusic" ? "Apple Music" : platform}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
