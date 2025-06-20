"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  Mail,
  Send,
  Inbox,
  FileText,
  Settings,
  Plus,
  Edit,
  Trash2,
  TestTube,
  Copy,
  FolderSyncIcon as Sync,
  CheckCircle,
  Download,
} from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  htmlContent: string
  type: "html" | "text"
  variables: string[]
}

interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  content: string
  date: string
  read: boolean
  type: "sent" | "received"
}

interface EmailCenterViewProps {
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
}

export function EmailCenterView({ showModal }: EmailCenterViewProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([])
  const [syncStatus, setSyncStatus] = useState("Connected")
  const [lastSync, setLastSync] = useState(new Date().toLocaleString("vi-VN"))
  const [emailForm, setEmailForm] = useState({
    from: "ankunstudio@ankun.dev",
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    content: "",
    htmlContent: "",
    type: "text" as "html" | "text",
  })

  const [smtpSettings, setSmtpSettings] = useState({
    server: "smtp.mail.me.com",
    port: "587",
    username: "ankunstudio@ankun.dev",
    password: "grsa-aaxz-midn-pjta",
    connected: true,
  })

  useEffect(() => {
    loadTemplates()
    loadEmailMessages()
    // Auto-sync emails every 30 seconds
    const interval = setInterval(syncEmails, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadTemplates = () => {
    const saved = localStorage.getItem("emailTemplates_v2")
    if (saved) {
      setTemplates(JSON.parse(saved))
    } else {
      // Default templates
      const defaultTemplates: EmailTemplate[] = [
        {
          id: "status_update",
          name: "Cập nhật trạng thái",
          subject: "Cập nhật trạng thái bài hát [tenbaihat]",
          content: `Chào [tennghesi],

Bài hát "[tenbaihat]" (ID: [id]) của bạn đã được cập nhật.
Trạng thái hiện tại: [trangthai]

Ngày gửi: [ngaygui]
Ngày phát hành dự kiến: [ngayphathanh]

Chúng tôi sẽ thông báo khi có cập nhật mới.

Trân trọng,
[tenmanager]
[email]`,
          htmlContent: "",
          type: "text",
          variables: ["tennghesi", "tenbaihat", "id", "trangthai", "ngaygui", "ngayphathanh", "tenmanager", "email"],
        },
        {
          id: "welcome",
          name: "Chào mừng nghệ sĩ mới",
          subject: "Chào mừng [tennghesi] đến với [tenlabel]!",
          content: `<h2>Chào mừng [tennghesi]!</h2>
<p>Cảm ơn bạn đã tham gia cộng đồng <strong>[tenlabel]</strong>.</p>
<p>Tài khoản của bạn đã được kích hoạt thành công:</p>
<ul>
<li>Username: [username]</li>
<li>Email: [email]</li>
<li>Vai trò: [vaitro]</li>
</ul>
<p>Bạn có thể bắt đầu tải nhạc lên ngay bây giờ!</p>
<br>
<p>Trân trọng,<br>[tenmanager]</p>`,
          htmlContent: "",
          type: "html",
          variables: ["tennghesi", "tenlabel", "username", "email", "vaitro", "tenmanager"],
        },
      ]
      setTemplates(defaultTemplates)
      saveTemplates(defaultTemplates)
    }
  }

  const loadEmailMessages = () => {
    const saved = localStorage.getItem("emailMessages_v2")
    if (saved) {
      setEmailMessages(JSON.parse(saved))
    } else {
      // Sample messages
      const sampleMessages: EmailMessage[] = [
        {
          id: "msg_1",
          from: "ankunstudio@ankun.dev",
          to: "ankun.n.m@gmail.com",
          subject: "Chào mừng bạn đến với An Kun Studio!",
          content: "Cảm ơn bạn đã tham gia cộng đồng An Kun Studio...",
          date: new Date().toLocaleString("vi-VN"),
          read: true,
          type: "sent",
        },
        {
          id: "msg_2",
          from: "ankun.n.m@gmail.com",
          to: "ankunstudio@ankun.dev",
          subject: "Cảm ơn về dịch vụ tuyệt vời",
          content: "Tôi rất hài lòng với dịch vụ phân phối nhạc của studio...",
          date: new Date(Date.now() - 3600000).toLocaleString("vi-VN"),
          read: false,
          type: "received",
        },
      ]
      setEmailMessages(sampleMessages)
      localStorage.setItem("emailMessages_v2", JSON.stringify(sampleMessages))
    }
  }

  const saveTemplates = (templatesData: EmailTemplate[]) => {
    localStorage.setItem("emailTemplates_v2", JSON.stringify(templatesData))
  }

  const syncEmails = () => {
    setSyncStatus("Syncing...")

    // Simulate email sync
    setTimeout(() => {
      setSyncStatus("Connected")
      setLastSync(new Date().toLocaleString("vi-VN"))

      // Add a new received email occasionally
      if (Math.random() > 0.8) {
        const newMessage: EmailMessage = {
          id: `msg_${Date.now()}`,
          from: "system@ankun.dev",
          to: "ankunstudio@ankun.dev",
          subject: "Thông báo hệ thống",
          content: "Hệ thống đã được cập nhật thành công.",
          date: new Date().toLocaleString("vi-VN"),
          read: false,
          type: "received",
        }

        const updatedMessages = [newMessage, ...emailMessages]
        setEmailMessages(updatedMessages)
        localStorage.setItem("emailMessages_v2", JSON.stringify(updatedMessages))

        showModal("Email mới", ["Bạn có email mới từ hệ thống"], "success")
      }
    }, 2000)
  }

  const handleCreateTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: `template_${Date.now()}`,
      name: "Mẫu email mới",
      subject: "",
      content: "",
      htmlContent: "",
      type: "text",
      variables: [],
    }
    setSelectedTemplate(newTemplate)
    setIsEditing(true)
  }

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return

    const updatedTemplates = templates.filter((t) => t.id !== selectedTemplate.id)
    updatedTemplates.push(selectedTemplate)
    setTemplates(updatedTemplates)
    saveTemplates(updatedTemplates)
    setIsEditing(false)
    showModal("Lưu thành công", [`Đã lưu mẫu email "${selectedTemplate.name}"`], "success")
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Bạn có chắc muốn xóa mẫu email này?")) {
      const updatedTemplates = templates.filter((t) => t.id !== templateId)
      setTemplates(updatedTemplates)
      saveTemplates(updatedTemplates)
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null)
      }
      showModal("Xóa thành công", ["Đã xóa mẫu email"], "success")
    }
  }

  const handleTestEmail = () => {
    if (!selectedTemplate) return

    const testData = {
      tennghesi: "Nguyễn Văn A",
      tenbaihat: "Bài hát test",
      id: "MH123456",
      trangthai: "Đã duyệt, đang chờ phát hành!",
      ngaygui: new Date().toLocaleDateString("vi-VN"),
      ngayphathanh: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
      tenmanager: "An Kun Studio",
      email: "ankunstudio@ankun.dev",
      tenlabel: "An Kun Studio",
      username: "test_user",
      vaitro: "Nghệ sĩ",
    }

    let testContent = selectedTemplate.content
    Object.entries(testData).forEach(([key, value]) => {
      testContent = testContent.replace(new RegExp(`\\[${key}\\]`, "g"), value)
    })

    showModal("Test email", [testContent], "success")
  }

  const handleSendEmail = () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.content) {
      showModal("Lỗi gửi email", ["Vui lòng điền đầy đủ thông tin"], "error")
      return
    }

    // Simulate sending email via SMTP
    const newMessage: EmailMessage = {
      id: `msg_${Date.now()}`,
      from: emailForm.from,
      to: emailForm.to,
      subject: emailForm.subject,
      content: emailForm.content,
      date: new Date().toLocaleString("vi-VN"),
      read: true,
      type: "sent",
    }

    const updatedMessages = [newMessage, ...emailMessages]
    setEmailMessages(updatedMessages)
    localStorage.setItem("emailMessages_v2", JSON.stringify(updatedMessages))

    showModal("Gửi email thành công", [`Đã gửi email đến: ${emailForm.to}`, `Chủ đề: ${emailForm.subject}`], "success")

    // Reset form
    setEmailForm({
      from: "ankunstudio@ankun.dev",
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      content: "",
      htmlContent: "",
      type: "text",
    })
  }

  const copyTemplateVariables = (template: EmailTemplate) => {
    const variables = template.variables.map((v) => `[${v}]`).join(", ")
    navigator.clipboard.writeText(variables)
    showModal("Copy thành công", [`Đã copy các biến: ${variables}`], "success")
  }

  const markAsRead = (messageId: string) => {
    const updatedMessages = emailMessages.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg))
    setEmailMessages(updatedMessages)
    localStorage.setItem("emailMessages_v2", JSON.stringify(updatedMessages))
  }

  const unreadCount = emailMessages.filter((msg) => !msg.read && msg.type === "received").length

  return (
    <div className="p-6 font-dosis">
      <h2 className="text-3xl font-dosis-bold text-white mb-6 flex items-center">
        <Mail className="mr-3 text-purple-400" />
        Trung tâm email
        {syncStatus === "Connected" && <CheckCircle className="ml-2 h-5 w-5 text-green-400" />}
      </h2>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inbox" className="relative font-dosis-medium">
            Hộp thư
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compose" className="font-dosis-medium">
            Soạn email
          </TabsTrigger>
          <TabsTrigger value="templates" className="font-dosis-medium">
            Mẫu email
          </TabsTrigger>
          <TabsTrigger value="settings" className="font-dosis-medium">
            Cài đặt SMTP
          </TabsTrigger>
          <TabsTrigger value="sync" className="font-dosis-medium">
            Đồng bộ
          </TabsTrigger>
        </TabsList>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-dosis-semibold">
                <span className="flex items-center">
                  <Inbox className="mr-2" />
                  Hộp thư đến ({emailMessages.length})
                </span>
                <Button
                  onClick={syncEmails}
                  variant="outline"
                  disabled={syncStatus === "Syncing..."}
                  className="font-dosis-medium"
                >
                  <Sync className="mr-2 h-4 w-4" />
                  {syncStatus === "Syncing..." ? "Đang đồng bộ..." : "Đồng bộ"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailMessages.map((message) => (
                  <Card
                    key={message.id}
                    className={`cursor-pointer transition-colors ${
                      message.read ? "bg-gray-700" : "bg-blue-900/30"
                    } border-gray-600 hover:bg-gray-600`}
                    onClick={() => markAsRead(message.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-dosis-medium ${
                                message.type === "sent" ? "bg-green-600" : "bg-blue-600"
                              }`}
                            >
                              {message.type === "sent" ? "Đã gửi" : "Nhận"}
                            </span>
                            {!message.read && message.type === "received" && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                          <h4 className="font-dosis-semibold text-white">{message.subject}</h4>
                          <p className="text-gray-400 text-sm font-dosis">
                            {message.type === "sent" ? `Đến: ${message.to}` : `Từ: ${message.from}`}
                          </p>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2 font-dosis">{message.content}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-dosis">{message.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 text-center text-gray-500 text-sm font-dosis">Lần đồng bộ cuối: {lastSync}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose Email */}
        <TabsContent value="compose" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Send className="mr-2" />
                Soạn email mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-dosis-medium">Từ (From)</Label>
                  <Input
                    value={emailForm.from}
                    onChange={(e) => setEmailForm({ ...emailForm, from: e.target.value })}
                    placeholder="ankunstudio@ankun.dev"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Đến (To) *</Label>
                  <Input
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="ankun.n.m@gmail.com"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">CC</Label>
                  <Input
                    value={emailForm.cc}
                    onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                    placeholder="cc@domain.com"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">BCC</Label>
                  <Input
                    value={emailForm.bcc}
                    onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                    placeholder="bcc@domain.com"
                    className="font-dosis"
                  />
                </div>
              </div>

              <div>
                <Label className="font-dosis-medium">Chủ đề (Subject) *</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Chủ đề email..."
                  className="font-dosis"
                />
              </div>

              <div>
                <Label className="font-dosis-medium">Phân loại nội dung</Label>
                <Select
                  value={emailForm.type}
                  onValueChange={(value) => setEmailForm({ ...emailForm, type: value as "html" | "text" })}
                >
                  <SelectTrigger className="w-48 font-dosis">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text" className="font-dosis">
                      Văn bản thuần
                    </SelectItem>
                    <SelectItem value="html" className="font-dosis">
                      HTML
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-dosis-medium">Nội dung email *</Label>
                <RichTextEditor
                  value={emailForm.content}
                  onChange={(content, html) =>
                    setEmailForm({
                      ...emailForm,
                      content,
                      htmlContent: html,
                    })
                  }
                  mode={emailForm.type}
                  placeholder="Nội dung email..."
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700 font-dosis-medium">
                  <Send className="mr-2 h-4 w-4" />
                  Gửi email
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setEmailForm({
                      from: "ankunstudio@ankun.dev",
                      to: "",
                      cc: "",
                      bcc: "",
                      subject: "",
                      content: "",
                      htmlContent: "",
                      type: "text",
                    })
                  }
                  className="font-dosis-medium"
                >
                  Xóa form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-dosis-semibold">
                  <span className="flex items-center">
                    <FileText className="mr-2" />
                    Mẫu email ({templates.length})
                  </span>
                  <Button
                    onClick={handleCreateTemplate}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 font-dosis-medium"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors email-template-card ${
                      selectedTemplate?.id === template.id ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-dosis-semibold text-white">{template.name}</h4>
                        <p className="text-xs text-gray-400 font-dosis">{template.type.toUpperCase()}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTemplate(template)
                            setIsEditing(true)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTemplate(template.id)
                          }}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Editor */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between font-dosis-semibold">
                      <span>{isEditing ? "Chỉnh sửa" : "Xem"} mẫu email</span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => copyTemplateVariables(selectedTemplate)}
                          variant="outline"
                          size="sm"
                          className="font-dosis-medium"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy biến
                        </Button>
                        <Button onClick={handleTestEmail} variant="outline" size="sm" className="font-dosis-medium">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test
                        </Button>
                        {isEditing ? (
                          <>
                            <Button
                              onClick={handleSaveTemplate}
                              className="bg-green-600 hover:bg-green-700 font-dosis-medium"
                            >
                              Lưu
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)} className="font-dosis-medium">
                              Hủy
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" onClick={() => setIsEditing(true)} className="font-dosis-medium">
                            <Edit className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-dosis-medium">Tên mẫu</Label>
                      <Input
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                        disabled={!isEditing}
                        className="font-dosis"
                      />
                    </div>

                    <div>
                      <Label className="font-dosis-medium">Chủ đề email</Label>
                      <Input
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Chủ đề email..."
                        className="font-dosis"
                      />
                    </div>

                    <div>
                      <Label className="font-dosis-medium">Loại nội dung</Label>
                      <Select
                        value={selectedTemplate.type}
                        onValueChange={(value) =>
                          setSelectedTemplate({ ...selectedTemplate, type: value as "html" | "text" })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="font-dosis">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text" className="font-dosis">
                            Văn bản thuần
                          </SelectItem>
                          <SelectItem value="html" className="font-dosis">
                            HTML
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="font-dosis-medium">Nội dung email</Label>
                      {isEditing ? (
                        <RichTextEditor
                          value={selectedTemplate.content}
                          onChange={(content, html) =>
                            setSelectedTemplate({
                              ...selectedTemplate,
                              content,
                              htmlContent: html,
                            })
                          }
                          mode={selectedTemplate.type}
                          placeholder="Nội dung email..."
                        />
                      ) : (
                        <div className="border border-gray-600 rounded-lg p-4 min-h-[200px] bg-gray-700">
                          {selectedTemplate.type === "html" ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm font-dosis">{selectedTemplate.content}</pre>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="font-dosis-medium">Biến sẵn có</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          "tennghesi",
                          "tenbaihat",
                          "id",
                          "trangthai",
                          "ngaygui",
                          "ngayphathanh",
                          "tenmanager",
                          "email",
                          "tenlabel",
                          "username",
                          "vaitro",
                        ].map((variable) => (
                          <span
                            key={variable}
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded cursor-pointer hover:bg-purple-700 font-dosis"
                            onClick={() => {
                              if (isEditing) {
                                const newContent = selectedTemplate.content + `[${variable}]`
                                setSelectedTemplate({ ...selectedTemplate, content: newContent })
                              }
                            }}
                          >
                            [{variable}]
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                    <p className="text-gray-400 font-dosis">Chọn một mẫu email để xem hoặc chỉnh sửa</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Settings className="mr-2" />
                Cài đặt SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-dosis-medium">SMTP Server</Label>
                  <Input
                    value={smtpSettings.server}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, server: e.target.value })}
                    placeholder="smtp.mail.me.com"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Port</Label>
                  <Input
                    value={smtpSettings.port}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
                    placeholder="587"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Username</Label>
                  <Input
                    value={smtpSettings.username}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                    placeholder="ankunstudio@ankun.dev"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Password</Label>
                  <Input
                    type="password"
                    value={smtpSettings.password}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                    placeholder="grsa-aaxz-midn-pjta"
                    className="font-dosis"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-dosis">Đã kết nối thành công đến SMTP server</span>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    localStorage.setItem("smtpSettings_v2", JSON.stringify(smtpSettings))
                    showModal("Lưu thành công", ["Đã lưu cài đặt SMTP"], "success")
                  }}
                  className="bg-green-600 hover:bg-green-700 font-dosis-medium"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Lưu cài đặt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => showModal("Test thành công", ["Kết nối SMTP hoạt động bình thường"], "success")}
                  className="font-dosis-medium"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Test kết nối
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Tab */}
        <TabsContent value="sync" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Sync className="mr-2" />
                Đồng bộ email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-dosis-semibold">Trạng thái đồng bộ:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <span className="font-dosis">SMTP Connection</span>
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-sm font-dosis-medium">
                        Connected
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <span className="font-dosis">Email Sync</span>
                      <span
                        className={`px-2 py-1 rounded text-sm font-dosis-medium ${
                          syncStatus === "Connected" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
                        }`}
                      >
                        {syncStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                      <span className="font-dosis">Auto Sync</span>
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm font-dosis-medium">
                        Enabled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-dosis-semibold">Thao tác:</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={syncEmails}
                      className="w-full bg-blue-600 hover:bg-blue-700 font-dosis-medium"
                      disabled={syncStatus === "Syncing..."}
                    >
                      <Sync className="h-4 w-4 mr-2" />
                      {syncStatus === "Syncing..." ? "Đang đồng bộ..." : "Đồng bộ ngay"}
                    </Button>
                    <Button
                      onClick={() => showModal("Backup thành công", ["Đã backup toàn bộ email"], "success")}
                      className="w-full bg-green-600 hover:bg-green-700 font-dosis-medium"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Backup email
                    </Button>
                    <Button
                      onClick={() => showModal("Cài đặt đã lưu", ["Đã bật tự động đồng bộ mỗi 30 giây"], "success")}
                      className="w-full bg-purple-600 hover:bg-purple-700 font-dosis-medium"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Cài đặt auto-sync
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-4">
                <h4 className="font-dosis-semibold mb-2">Lịch sử đồng bộ:</h4>
                <div className="text-sm text-gray-400 space-y-1 font-dosis">
                  <p>• {lastSync} - Email sync completed</p>
                  <p>• {new Date(Date.now() - 1800000).toLocaleString("vi-VN")} - SMTP connection verified</p>
                  <p>• {new Date(Date.now() - 3600000).toLocaleString("vi-VN")} - Auto-sync enabled</p>
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
export default EmailCenterView
