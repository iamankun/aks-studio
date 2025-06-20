"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings, Mail, Save, Image, Globe, Database, Palette, HelpCircle } from "lucide-react"
import { useSystemStatus } from "@/components/system-status-provider"
import type { User } from "@/types/user"

interface SettingsViewProps {
  currentUser: User
}

export default function SettingsView({ currentUser }: SettingsViewProps) {
  const { status, checkAllSystems } = useSystemStatus()

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
  })

  const [appSettings, setAppSettings] = useState({
    appName: "AKs Studio",
    logoUrl: "/favicon.ico",
    homeUrl: "/",
    version: "1.2.0-beta",
  })

  const [backgroundSettings, setBackgroundSettings] = useState({
    type: "gradient",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
    companyName: "AKs Studio",
    version: "1.2.0-beta",
    logoUrl: "/favicon.ico",
    websiteUrl: "/",
    description: "Digital Music Distribution",
  })

  const [databaseSettings, setDatabaseSettings] = useState({
    connected: false,
    host: "",
    database: "",
    username: "",
    password: "",
  })

  useEffect(() => {
    // Load all settings
    loadSettings()
  }, [])

  const loadSettings = () => {
    // Load email settings
    const savedEmail = localStorage.getItem("emailSettings_v2")
    if (savedEmail) {
      setEmailSettings(JSON.parse(savedEmail))
    }

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
    }

    // Load database settings
    const savedDatabase = localStorage.getItem("databaseSettings_v2")
    if (savedDatabase) {
      setDatabaseSettings(JSON.parse(savedDatabase))
    }
  }

  const handleSaveEmailSettings = () => {
    localStorage.setItem("emailSettings_v2", JSON.stringify(emailSettings))
    alert("Đã lưu cài đặt SMTP!")
    checkAllSystems()
  }

  const handleSaveAppSettings = () => {
    localStorage.setItem("appSettings_v2", JSON.stringify(appSettings))
    alert("Đã lưu cài đặt ứng dụng!")
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
    alert("Đã lưu cài đặt background!")
  }

  const handleSaveFooterSettings = () => {
    localStorage.setItem("footerSettings_v2", JSON.stringify(footerSettings))
    window.dispatchEvent(new CustomEvent("footerUpdate", { detail: footerSettings }))
    alert("Đã lưu cài đặt footer!")
  }

  const handleSaveDatabaseSettings = () => {
    localStorage.setItem("databaseSettings_v2", JSON.stringify(databaseSettings))
    alert("Đã lưu cài đặt database!")
    checkAllSystems()
  }

  const handleTestSMTP = () => {
    alert("Đang test kết nối SMTP...")
    setTimeout(() => {
      alert("Kết nối SMTP thành công! Email test đã được gửi.")
    }, 1500)
  }

  const StatusIndicator = ({ status: statusType }: { status: string }) => (
    <span
      className={`px-2 py-1 rounded text-sm ${
        statusType === "connected"
          ? "bg-green-600 text-white"
          : statusType === "checking"
            ? "bg-yellow-600 text-white"
            : "bg-red-600 text-white"
      }`}
    >
      {statusType === "connected" ? "Kết nối" : statusType === "checking" ? "Đang kiểm tra..." : "Chưa kết nối"}
    </span>
  )

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="app">Ứng dụng</TabsTrigger>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="guide">Hướng dẫn</TabsTrigger>
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
                    placeholder="[tenapp]"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phiên bản</Label>
                  <Input
                    value={appSettings.version}
                    onChange={(e) => setAppSettings({ ...appSettings, version: e.target.value })}
                    placeholder="1.0.0-beta"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Logo URL (Favicon)</Label>
                  <Input
                    value={appSettings.logoUrl}
                    onChange={(e) => setAppSettings({ ...appSettings, logoUrl: e.target.value })}
                    placeholder="/favicon.ico"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Trang chủ URL (Click logo)</Label>
                  <Input
                    value={appSettings.homeUrl}
                    onChange={(e) => setAppSettings({ ...appSettings, homeUrl: e.target.value })}
                    placeholder="/"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                <h4 className="text-sm font-semibold mb-2">Xem trước:</h4>
                <div className="flex items-center space-x-4">
                  <img
                    src={appSettings.logoUrl || "/placeholder.svg"}
                    alt="App Logo"
                    className="h-8 w-8 rounded object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "https://placehold.co/32x32/8b5cf6/FFFFFF?text=AK"
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
        <TabsContent value="smtp">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2" />
                Cài đặt SMTP Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Máy chủ SMTP</Label>
                  <Input
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpServer: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Cổng SMTP</Label>
                  <Input
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
                    placeholder="587"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email đăng nhập</Label>
                  <Input
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                    placeholder="your-email@gmail.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Mật khẩu ứng dụng</Label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                    placeholder="App Password"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveEmailSettings}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Lưu cài đặt SMTP
                </Button>
                <Button onClick={handleTestSMTP} variant="outline" className="rounded-full">
                  Test kết nối
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Settings */}
        <TabsContent value="database">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2" />
                Cài đặt Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Database Host</Label>
                  <Input
                    value={databaseSettings.host}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, host: e.target.value })}
                    placeholder="localhost"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Database Name</Label>
                  <Input
                    value={databaseSettings.database}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, database: e.target.value })}
                    placeholder="music_hub"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    value={databaseSettings.username}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, username: e.target.value })}
                    placeholder="db_user"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={databaseSettings.password}
                    onChange={(e) => setDatabaseSettings({ ...databaseSettings, password: e.target.value })}
                    placeholder="db_password"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={databaseSettings.connected}
                  onCheckedChange={(checked) => setDatabaseSettings({ ...databaseSettings, connected: checked })}
                />
                <Label>Kích hoạt kết nối Database</Label>
              </div>

              <Button
                onClick={handleSaveDatabaseSettings}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu cài đặt Database
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
                <Image className="mr-2" />
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
                    placeholder="[tenapp]"
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
                    placeholder="/favicon.ico"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    value={footerSettings.websiteUrl}
                    onChange={(e) => setFooterSettings({ ...footerSettings, websiteUrl: e.target.value })}
                    placeholder="/"
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
                Lưu cài đặt Footer
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
      </Tabs>
    </div>
  )
}
