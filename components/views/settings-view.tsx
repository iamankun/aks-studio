"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusIndicator } from "@/components/status-indicator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, ImageIcon, Globe, Palette, HelpCircle, Mail, Database } from "lucide-react"
import { useSystemStatus } from "@/components/system-status-provider"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"

export function SettingsView() {
  const { user: currentUser } = useAuth();
  const { status, checkAllSystems } = useSystemStatus()

  // Email settings removed - managed through environment variables

  const [appSettings, setAppSettings] = useState({
    appName: "AKs Studio",
    logoUrl: "/face.png",
    homeUrl: "/",
    version: "1.0.0",
  })

  const [appMode, setAppMode] = useState("demo") // demo or production

  const [backgroundSettings, setBackgroundSettings] = useState({
    type: "gradient",
    gradient: "linear-gradient(135deg,rgba(102, 126, 234, 0.14) 0%,rgba(118, 75, 162, 0.17) 100%)",
    videoUrl: "",
    opacity: 0.3,
    randomVideo: true,
    videoList: [
      "dQw4w9WgXcQ",
      "kJQP7kiw5Fk",
      "fJ9rUzIMcZQ",
      "9bZkp7q19f0",
      "hTWKbfoikeg",
      "YQHsXMglC9A",
      "CevxZvSJLk8",
      "JGwWNGJdvx8",
      "RgKAFK5djSk",
      "OPf0YbXqDm0",
    ],
  })

  const [footerSettings, setFooterSettings] = useState({
    companyName: "AKs Studio", // Giá trị mặc định
    version: "1.0.0", // Giá trị mặc định
    logoUrl: "/face.png", // Giá trị mặc định
    websiteUrl: "/", // Giá trị mặc định
    description: "Digital Music Distribution",
  })

  // Database settings removed - managed through environment variables

  useEffect(() => {
    // Load all settings
    loadSettings()
  }, [])

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

  const loadSettings = () => {
    // Load app mode from localStorage
    const savedMode = localStorage.getItem("APP_MODE")
    if (savedMode) {
      setAppMode(savedMode)
    }

    // Email settings are now managed through environment variables

    // Load app settings
    const savedApp = localStorage.getItem("appSettings_v2")
    if (savedApp) {
      setAppSettings(JSON.parse(savedApp))
    }

    // Load background settings
    const savedBackground = localStorage.getItem("backgroundSettings_v2")
    if (savedBackground) {
      setBackgroundSettings(JSON.parse(savedBackground))
    }

    // Load footer settings
    const savedFooter = localStorage.getItem("footerSettings_v2")
    if (savedFooter) {
      setFooterSettings(JSON.parse(savedFooter))
    } else {
      // Cập nhật footerSettings nếu appSettings đã được tải, hoặc dùng giá trị mặc định
      if (savedApp) {
        const parsedApp = JSON.parse(savedApp)
        setFooterSettings((prev) => ({
          ...prev,
          companyName: parsedApp.appName,
          version: parsedApp.version,
          logoUrl: parsedApp.logoUrl,
          websiteUrl: parsedApp.homeUrl,
        }))
      }
    }

    // Database settings are now managed through environment variables
  }

  // Email settings handlers removed - now managed through environment variables

  const handleSaveAppSettings = () => {
    localStorage.setItem("appSettings_v2", JSON.stringify(appSettings))
    showModal("Lưu thành công", ["Đã lưu cài đặt ứng dụng!"], "success")
    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (favicon) {
      favicon.href = appSettings.logoUrl
    }
    // Update title
    document.title = `${appSettings.appName} - Digital Music Distribution`
  }

  const handleSaveBackgroundSettings = () => {
    localStorage.setItem("backgroundSettings_v2", JSON.stringify(backgroundSettings))
    window.dispatchEvent(new CustomEvent("backgroundUpdate", { detail: backgroundSettings }))
    showModal("Lưu thành công", ["Đã lưu cài đặt background!"], "success")
  }

  const handleSaveFooterSettings = () => {
    localStorage.setItem("footerSettings_v2", JSON.stringify(footerSettings))
    window.dispatchEvent(new CustomEvent("footerUpdate", { detail: footerSettings }))
    showModal("Lưu thành công", ["Đã lưu cài đặt footer!"], "success")
  }

  // Database and SMTP handlers removed - now managed through environment variables

  // Helper function to show modal (can be moved to a context or prop if needed more globally)
  const showModal = (title: string, messages: string[], type: "error" | "success" = "error") => {
    const event = new CustomEvent("showGlobalNotification", {
      detail: {
        title,
        message: messages.join(" "),
        type,
      },
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="p-2 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Settings className="mr-3 text-purple-400" />
          Cài đặt hệ thống
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-400">SMTP:</span> <StatusIndicator status={status.smtp} />
          </div>
          <div className="text-sm">
            <span className="text-gray-400">DB:</span> <StatusIndicator status={status.database} />
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Storage:</span> <StatusIndicator status={status.localStorage} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="app" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="app">Name App</TabsTrigger>
          <TabsTrigger value="mode">Mode</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="guide">Guide</TabsTrigger>
        </TabsList>

        {/* App Settings */}
        <TabsContent value="app">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2" />
                Cài đặt ứng dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tên ứng dụng</Label>
                  <Input
                    value={appSettings.appName}
                    onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                    placeholder="[Điều chỉnh tên trong ứng dụng]"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phiên bản</Label>
                  <Input
                    value={appSettings.version}
                    onChange={(e) => setAppSettings({ ...appSettings, version: e.target.value })}
                    placeholder={appSettings.version}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Logo URL (Favicon)</Label>
                  <Input
                    value={appSettings.logoUrl}
                    onChange={(e) => setAppSettings({ ...appSettings, logoUrl: e.target.value })}
                    placeholder={appSettings.logoUrl}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Trang chủ URL (Click logo)</Label>
                  <Input
                    value={appSettings.homeUrl}
                    onChange={(e) => setAppSettings({ ...appSettings, homeUrl: e.target.value })}
                    placeholder={appSettings.homeUrl}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                <h4 className="text-sm font-semibold mb-2">Xem trước:</h4>
                <div className="flex items-center space-x-4">
                  <img
                    src={appSettings.logoUrl || "/movies.webp"}
                    alt="App Logo"
                    className="h-8 w-8 rounded object-cover"
                    onError={(e) => {
                      ; (e.target as HTMLImageElement).src = appSettings.logoUrl || "/face.png"
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-white">{appSettings.appName}</h3>
                    <p className="text-sm text-gray-400">v{appSettings.version}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveAppSettings}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu cài đặt ứng dụng
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Settings */}
        {/* SMTP and Database tabs have been removed */}

        {/* Background Settings */}
        <TabsContent value="background">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2" />
                Cài đặt Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Loại Background</Label>
                <Select
                  value={backgroundSettings.type}
                  onValueChange={(value) => setBackgroundSettings({ ...backgroundSettings, type: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="video">Video YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {backgroundSettings.type === "gradient" && (
                <div>
                  <Label>CSS Gradient</Label>
                  <Textarea
                    value={backgroundSettings.gradient}
                    onChange={(e) => setBackgroundSettings({ ...backgroundSettings, gradient: e.target.value })}
                    placeholder="linear-gradient(135deg,rgba(102, 126, 234, 0.19) 0%,rgba(118, 75, 162, 0.2) 100%)"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}

              {backgroundSettings.type === "video" && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={backgroundSettings.randomVideo}
                      onCheckedChange={(checked) =>
                        setBackgroundSettings({ ...backgroundSettings, randomVideo: checked })
                      }
                    />
                    <Label>Video ngẫu nhiên</Label>
                  </div>

                  {!backgroundSettings.randomVideo && (
                    <div>
                      <Label>YouTube URL</Label>
                      <Input
                        value={backgroundSettings.videoUrl}
                        onChange={(e) => setBackgroundSettings({ ...backgroundSettings, videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Danh sách Video ID (mỗi dòng một ID)</Label>
                    <Textarea
                      value={backgroundSettings.videoList.join("\n")}
                      onChange={(e) =>
                        setBackgroundSettings({
                          ...backgroundSettings,
                          videoList: e.target.value.split("\n").filter((id) => id.trim()),
                        })
                      }
                      placeholder="dQw4w9WgXcQ&#10;kJQP7kiw5Fk&#10;..."
                      className="mt-1"
                      rows={6}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Độ mờ: {backgroundSettings.opacity}</Label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={backgroundSettings.opacity}
                  onChange={(e) =>
                    setBackgroundSettings({ ...backgroundSettings, opacity: Number.parseFloat(e.target.value) })
                  }
                  className="w-full mt-1"
                />
              </div>

              <Button
                onClick={handleSaveBackgroundSettings}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu cài đặt Background
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2" />
                Cài đặt Footer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Label records</Label>
                  <Input
                    value={footerSettings.companyName}
                    onChange={(e) => setFooterSettings({ ...footerSettings, companyName: e.target.value })}
                    placeholder={appSettings.appName}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phiên bản</Label>
                  <Input
                    value={footerSettings.version}
                    onChange={(e) => setFooterSettings({ ...footerSettings, version: e.target.value })}
                    placeholder="1.2.0-beta"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={footerSettings.logoUrl}
                    onChange={(e) => setFooterSettings({ ...footerSettings, logoUrl: e.target.value })}
                    placeholder={appSettings.logoUrl}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    value={footerSettings.websiteUrl}
                    onChange={(e) => setFooterSettings({ ...footerSettings, websiteUrl: e.target.value })}
                    placeholder={appSettings.homeUrl}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Mô tả</Label>
                <Input
                  value={footerSettings.description}
                  onChange={(e) => setFooterSettings({ ...footerSettings, description: e.target.value })}
                  placeholder="Digital Music Distribution"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleSaveFooterSettings}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu cài đặt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guide */}
        <TabsContent value="guide">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2" />
                Hướng dẫn sử dụng {appSettings.appName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <h3>🚀 Hướng dẫn cài đặt và sử dụng {appSettings.appName}</h3>

                <h4>1. Đăng nhập hệ thống</h4>
                <ul>
                  <li>
                    <strong>Label Manager:</strong> admin / admin (toàn quyền)
                  </li>
                  <li>
                    <strong>Nghệ sĩ:</strong> artist / 123456 (quyền hạn chế)
                  </li>
                </ul>

                <h4>2. Cấu hình hệ thống (Label Manager)</h4>
                <ol>
                  <li>
                    <strong>Cài đặt SMTP:</strong> Cấu hình email để gửi thông báo
                  </li>
                  <li>
                    <strong>Cài đặt Database:</strong> Kết nối database để lưu trữ dữ liệu
                  </li>
                  <li>
                    <strong>Cài đặt ứng dụng:</strong> Tùy chỉnh tên, logo, trang chủ
                  </li>
                  <li>
                    <strong>Cài đặt Background:</strong> Chọn gradient hoặc video YouTube
                  </li>
                </ol>

                <h4>3. Quản lý người dùng</h4>
                <p>Label Manager có thể:</p>
                <ul>
                  <li>Tạo, sửa, xóa tài khoản nghệ sĩ</li>
                  <li>Thay đổi thông tin cá nhân của nghệ sĩ</li>
                  <li>Quản lý quyền hạn và vai trò</li>
                </ul>

                <h4>4. Đăng tải nhạc</h4>
                <p>Cả Label Manager và Nghệ sĩ đều có thể:</p>
                <ul>
                  <li>Upload file nhạc (WAV, 24bit+)</li>
                  <li>Upload ảnh bìa (JPG, 4000x4000px)</li>
                  <li>Điền thông tin metadata</li>
                  <li>Chọn ngày phát hành</li>
                </ul>

                <h4>5. Quản lý bài hát</h4>
                <ul>
                  <li>Xem danh sách submissions</li>
                  <li>Cập nhật trạng thái phát hành</li>
                  <li>Tải xuống file nhạc và ảnh</li>
                  <li>Quản lý ISRC code</li>
                </ul>

                <h4>6. Tìm kiếm ISRC</h4>
                <p>Sử dụng công cụ tích hợp để:</p>
                <ul>
                  <li>Tra cứu thông tin ISRC</li>
                  <li>Kiểm tra bài hát trên các platform</li>
                  <li>Tránh trùng lặp khi phát hành</li>
                  <li>Tránh trùng lặp khi phát hành</li>
                </ul>

                {currentUser.role === "Label Manager" && (
                  <div className="mt-8 p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                    <h4>📋 Hướng dẫn Setup cho Label Manager</h4>
                    <p>Để chuyển từ chế độ Demo sang Production:</p>
                    <ol>
                      <li>Cấu hình SMTP với thông tin email thật</li>
                      <li>Kết nối database (MySQL/PostgreSQL)</li>
                      <li>Kiểm tra localStorage hoạt động</li>
                      <li>Khi cả 3 hệ thống kết nối, logo BETA sẽ tự động ẩn</li>
                    </ol>

                    <h5>Cấu hình SMTP Gmail:</h5>
                    <ul>
                      <li>Server: smtp.gmail.com</li>
                      <li>Port: 587</li>
                      <li>Tạo App Password trong Google Account</li>
                      <li>Sử dụng App Password thay vì mật khẩu thường</li>
                    </ul>

                    <h5>Tùy chỉnh giao diện:</h5>
                    <ul>
                      <li>Background: Gradient CSS hoặc YouTube video</li>
                      <li>Logo: Upload và set làm favicon</li>
                      <li>Footer: Tùy chỉnh thông tin công ty</li>
                      <li>Font: Dosis (mặc định, không thay đổi)</li>
                    </ul>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h5>💡 Mẹo sử dụng:</h5>
                  <ul>
                    <li>Click vào logo để về trang chủ</li>
                    <li>Sử dụng tính năng tìm kiếm ISRC trước khi phát hành</li>
                    <li>Backup dữ liệu thường xuyên</li>
                    <li>Kiểm tra trạng thái kết nối ở góc phải màn hình</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mode Settings */}
        <TabsContent value="mode">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-semibold">
                <Database className="mr-2" />
                Chế độ ứng dụng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Chế độ hiện tại: {appMode === "production" ? "Production" : "Demo"}</Label>
                    <div className="mt-2 p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Demo Mode</span>
                        <Switch
                          checked={appMode === "demo"}
                          onCheckedChange={(checked) => {
                            if (checked && appMode !== "demo") {
                              // Switch to demo
                              localStorage.setItem("APP_MODE", "demo")
                              setAppMode("demo")
                              window.location.reload()
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Sử dụng dữ liệu demo, không kết nối database/SMTP thực
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mt-2 p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Production Mode</span>
                        <Switch
                          checked={appMode === "production"}
                          onCheckedChange={(checked) => {
                            if (checked && appMode !== "production") {
                              // Switch to production
                              localStorage.setItem("APP_MODE", "production")
                              setAppMode("production")
                              window.location.reload()
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Kết nối database và SMTP thực, test chính thức
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-lg font-semibold">Thông tin chế độ</Label>
                    <div className="mt-2 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">🔧 Production Mode</h4>
                      <ul className="text-sm space-y-1 text-gray-300">
                        <li>✅ Kết nối PostgreSQL Database thực</li>
                        <li>✅ Gửi email qua SMTP thực</li>
                        <li>✅ Authentication từ database</li>
                        <li>✅ Lưu dữ liệu vào database</li>
                        <li>⚠️ Cần cấu hình database và SMTP đúng</li>
                      </ul>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                      <h4 className="font-semibold text-yellow-400 mb-2">🎮 Demo Mode</h4>
                      <ul className="text-sm space-y-1 text-gray-300">
                        <li>🎯 Dữ liệu demo/mock</li>
                        <li>🎯 Authentication giả lập</li>
                        <li>🎯 Email chỉ hiển thị, không gửi thực</li>
                        <li>🎯 Phù hợp để demo/test UI</li>
                        <li>💡 Không cần cấu hình gì</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2">⚡ Lưu ý quan trọng</h4>
                  <p className="text-sm text-gray-300">
                    Thay đổi chế độ sẽ reload lại ứng dụng. Đảm bảo bạn đã cấu hình đúng
                    Database URL và SMTP settings trong file .env.local trước khi chuyển sang Production Mode.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2" />
              Cài đặt hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="mr-2" />
                    Trạng thái hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Nền tảng</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Online</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-yellow-600">Demo Mode</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2" />
                    Giao diện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Cài đặt giao diện sẽ có trong bản cập nhật sau...</p>
                </CardContent>
              </Card>

              {currentUser.role === "Label Manager" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="mr-2" />
                      Cấu hình Email
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Cài đặt SMTP có sẵn trong Bảng điều khiển Quản trị</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
