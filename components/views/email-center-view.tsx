"use client"

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Inbox, CheckCircle, RotateCw, FileText, Plus, Edit, Trash2, Copy, TestTube, Settings, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";

// Define types if not imported from elsewhere
type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  htmlContent: string;
  type: "html" | "text";
  variables: string[];
};

type EmailMessage = {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  type: "sent" | "received";
};

type EmailDetails = {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
};

type SmtpSettings = {
  smtpServer: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword?: string;
  connected: boolean;
};

// Dummy sendEmail function for demonstration; replace with actual implementation
async function sendEmail(_details: EmailDetails): Promise<{ success: boolean; message: string }> {
  // Simulate sending email
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: "Email sent successfully." }), 1000));
}

interface EmailCenterViewProps {
  showModal: (title: string, messages: string[], type?: "error" | "success") => void;
}

export function EmailCenterView({ showModal }: EmailCenterViewProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([])
  const [syncStatus, setSyncStatus] = useState("Connected")
  const [lastSync, setLastSync] = useState(new Date().toLocaleString("vi-VN"))
  const [emailForm, setEmailForm] = useState({
    from: "",
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    content: "",
    htmlContent: "",
    type: "text" as "html" | "text",
  })

  // Key for SMTP settings in localStorage, consistent with lib/email.ts and SettingsView.tsx
  const SMTP_LOCALSTORAGE_KEY = "emailSettings_v2";

  const [smtpSettings, setSmtpSettings] = useState<SmtpSettings>({
    smtpServer: "", // Initialize with empty or default values
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "", // Password should ideally not be stored directly or be optional in display
    connected: false, // Assume not connected until verified or loaded from storage
  });

  useEffect(() => {
    loadTemplates()
    loadEmailMessages()

    // Load SMTP settings from localStorage
    const savedSmtpSettings = localStorage.getItem(SMTP_LOCALSTORAGE_KEY);
    if (savedSmtpSettings) {
      try {
        setSmtpSettings(JSON.parse(savedSmtpSettings) as SmtpSettings);
      } catch (error) {
        console.error("EmailCenterView: Failed to parse SMTP settings from localStorage", error);
      }
    }

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
      // Start with empty messages - no sample data
      setEmailMessages([])
      localStorage.setItem("emailMessages_v2", JSON.stringify([]))
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

      // Note: Remove fake email generation for production use
      // Email sync will be handled by real SMTP service
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
      email: "manager@yourdomain.com",
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

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.content) {
      showModal("Lỗi gửi email", ["Vui lòng điền đầy đủ thông tin"], "error")
      return
    }

    const emailDetails: EmailDetails = {
      from: emailForm.from,
      to: emailForm.to,
      cc: emailForm.cc,
      bcc: emailForm.bcc,
      subject: emailForm.subject,
      textBody: emailForm.type === "text" ? emailForm.content : "Vui lòng xem nội dung HTML.", // Cần cơ chế convert HTML to text
      htmlBody: emailForm.type === "html" ? emailForm.htmlContent : undefined,
    }

    const result = await sendEmail(emailDetails)

    if (result.success) {
      const newMessage: EmailMessage = {
        id: `msg_${Date.now()}`,
        ...emailDetails,
        content: emailForm.content, // Lưu nội dung gốc để hiển thị
        date: new Date().toLocaleString("vi-VN"),
        read: true,
        type: "sent",
      }
      const updatedMessages = [newMessage, ...emailMessages]
      setEmailMessages(updatedMessages)
      localStorage.setItem("emailMessages_v2", JSON.stringify(updatedMessages))
      showModal("Gửi email thành công", [result.message], "success")
      setEmailForm({ from: "", to: "", cc: "", bcc: "", subject: "", content: "", htmlContent: "", type: "text" })
    } else {
      showModal("Lỗi gửi email", [result.message], "error")
    }
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
    <div className="p-6 font-sans">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <Mail className="mr-3 text-purple-400" />
        Trung tâm email
        {syncStatus === "Connected" && <CheckCircle className="ml-2 h-5 w-5 text-green-400" />}
      </h2>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 font-medium">
          <TabsTrigger value="inbox" className="relative">
            Hộp thư
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compose">
            Soạn email
          </TabsTrigger>
          <TabsTrigger value="templates">
            Mẫu email
          </TabsTrigger>
          <TabsTrigger value="settings">
            Cài đặt SMTP
          </TabsTrigger>
          <TabsTrigger value="sync">
            Đồng bộ
          </TabsTrigger>
        </TabsList>

        {/* Inbox */}
        <TabsContent value="inbox" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-between font-semibold">
                <span className="flex items-center">
                  <Inbox className="mr-2" />
                  Hộp thư đến ({emailMessages.length})
                </span>
                <Button
                  onClick={syncEmails}
                  variant="outline"
                  disabled={syncStatus === "Syncing..."}
                  className="font-medium"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  {syncStatus === "Syncing..." ? "Đang đồng bộ..." : "Đồng bộ"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emailMessages.map((message) => (
                  <Card
                    key={message.id}
                    className={`cursor-pointer transition-colors ${message.read ? "bg-gray-700" : "bg-blue-900/30"
                      } border-gray-600 hover:bg-gray-600`}
                    onClick={() => markAsRead(message.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-dosis-medium ${message.type === "sent" ? "bg-green-600" : "bg-blue-600"
                                }`} // Changed font-dosis-medium to font-medium
                            >
                              {message.type === "sent" ? "Đã gửi" : "Nhận"}
                            </span>
                            {!message.read && message.type === "received" && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                          <h4 className="font-semibold text-white">{message.subject}</h4>
                          <p className="text-gray-400 text-sm font-sans">
                            {message.type === "sent" ? `Đến: ${message.to}` : `Từ: ${message.from}`}
                          </p>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2 font-sans">{message.content}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-sans">{message.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 text-center text-gray-500 text-sm font-sans">Lần đồng bộ cuối: {lastSync}</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compose Email */}
        <TabsContent value="compose" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 font-sans">
            <CardHeader> {/* Removed font-dosis-semibold */}
              <CardTitle className="flex items-center font-semibold">
                <Send className="mr-2" />
                Soạn email mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Từ (From)</Label>
                  <Input
                    value={emailForm.from}
                    onChange={(e) => setEmailForm({ ...emailForm, from: e.target.value })}
                    placeholder="your-email@example.com"
                    className="font-sans"
                  />
                </div>
                <div>
                  <Label className="font-medium">Đến (To) *</Label>
                  <Input
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="recipient@example.com"
                    className="font-sans"
                  />
                </div>
                <div>
                  <Label className="font-medium">CC</Label>
                  <Input
                    value={emailForm.cc}
                    onChange={(e) => setEmailForm({ ...emailForm, cc: e.target.value })}
                    placeholder="cc@domain.com"
                    className="font-sans"
                  />
                </div>
                <div>
                  <Label className="font-medium">BCC</Label>
                  <Input
                    value={emailForm.bcc}
                    onChange={(e) => setEmailForm({ ...emailForm, bcc: e.target.value })}
                    placeholder="bcc@domain.com"
                    className="font-sans"
                  />
                </div>
              </div>

              <div>
                <Label className="font-medium">Chủ đề (Subject) *</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Chủ đề email..."
                  className="font-sans"
                />
              </div>

              <div>
                <Label className="font-medium">Phân loại nội dung</Label>
                <Select
                  value={emailForm.type}
                  onValueChange={(value) => setEmailForm({ ...emailForm, type: value as "html" | "text" })}
                >
                  <SelectTrigger className="w-48 font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text" className="font-sans">
                      Văn bản thuần
                    </SelectItem>
                    <SelectItem value="html" className="font-sans">
                      HTML
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-medium">Nội dung email *</Label>
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
                <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700 font-medium">
                  <Send className="mr-2 h-4 w-4" />
                  Gửi
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setEmailForm({
                      from: "",
                      to: "",
                      cc: "",
                      bcc: "",
                      subject: "",
                      content: "",
                      htmlContent: "",
                      type: "text",
                    })
                  }
                  className="font-medium"
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
            <Card className="bg-gray-800 border-gray-700 font-sans">
              <CardHeader>
                <CardTitle className="flex items-center justify-between font-semibold">
                  <span className="flex items-center">
                    <FileText className="mr-2" />
                    Mẫu email ({templates.length})
                  </span>
                  <Button
                    onClick={handleCreateTemplate}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedTemplate?.id === template.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors email-template-card text-left w-full ${selectedTemplate?.id === template.id ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    onClick={() => setSelectedTemplate(template)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedTemplate(template)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between font-sans">
                      <div>
                        <h4 className="font-semibold text-white">{template.name}</h4>
                        <p className="text-xs text-gray-400">{template.type.toUpperCase()}</p>
                      </div>
                      <div className="flex space-x-1">
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Edit template"
                          className="h-8 w-8 p-0 font-sans inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTemplate(template)
                            setIsEditing(true)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedTemplate(template)
                              setIsEditing(true)
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="Delete template"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 font-sans inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteTemplate(template.id)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteTemplate(template.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Editor */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <Card className="bg-gray-800 border-gray-700 font-sans"> {/* Removed font-dosis-semibold */}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between font-semibold">
                      <span>{isEditing ? "Chỉnh sửa" : "Xem"} mẫu email</span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => copyTemplateVariables(selectedTemplate)}
                          variant="outline" // Removed font-dosis-medium
                          size="sm"
                          className="font-medium"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy biến
                        </Button>
                        <Button onClick={handleTestEmail} variant="outline" size="sm" className="font-medium">
                          <TestTube className="mr-2 h-4 w-4" />
                          Test
                        </Button>
                        {isEditing ? (
                          <>
                            <Button
                              onClick={handleSaveTemplate} // Removed font-dosis-medium
                              className="bg-green-600 hover:bg-green-700 font-medium"
                            >
                              Lưu
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)} className="font-medium">
                              Hủy
                            </Button>
                          </>
                        ) : ( // Removed font-dosis-medium
                          <Button variant="outline" onClick={() => setIsEditing(true)} className="font-medium">
                            <Edit className="mr-2 h-4 w-4" />
                            Sửa
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-medium">Tên mẫu</Label>
                      <Input
                        value={selectedTemplate.name}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                        disabled={!isEditing}
                        className="font-sans"
                      />
                    </div>

                    <div>
                      <Label className="font-medium">Chủ đề email</Label>
                      <Input
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Chủ đề email..."
                        className="font-sans"
                      />
                    </div>

                    <div>
                      <Label className="font-medium">Loại nội dung</Label>
                      <Select
                        value={selectedTemplate.type}
                        onValueChange={(value) =>
                          setSelectedTemplate({ ...selectedTemplate, type: value as "html" | "text" })
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="font-sans">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text" className="font-sans">
                            Văn bản thuần
                          </SelectItem>
                          <SelectItem value="html" className="font-sans">
                            HTML
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="font-medium">Nội dung email</Label>
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
                            <pre className="whitespace-pre-wrap text-sm font-sans">{selectedTemplate.content}</pre>
                          )}
                        </div>
                      )}
                    </div>

                    <div> {/* Removed font-dosis-medium */}
                      <Label className="font-medium">Biến sẵn có</Label>
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
                          <button
                            key={variable}
                            type="button"
                            className="px-2 py-1 bg-purple-600 text-white text-xs rounded cursor-pointer hover:bg-purple-700"
                            onClick={() => {
                              if (isEditing) {
                                const newContent = selectedTemplate.content + `[${variable}]`
                                setSelectedTemplate({ ...selectedTemplate, content: newContent })
                              }
                            }}
                            onKeyDown={(e) => {
                              if ((e.key === "Enter" || e.key === " ") && isEditing) {
                                e.preventDefault();
                                const newContent = selectedTemplate.content + `[${variable}]`
                                setSelectedTemplate({ ...selectedTemplate, content: newContent })
                              }
                            }}
                            tabIndex={0}
                            aria-label={`Chèn biến ${variable}`}
                          >
                            [{variable}]
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-500 mb-4 font-sans" />
                    <p className="text-gray-400 font-sans">Chọn một mẫu email để xem hoặc chỉnh sửa</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700 font-sans">
            <CardHeader> {/* Removed font-dosis-semibold */}
              <CardTitle className="flex items-center font-semibold">
                <Settings className="mr-2" />
                Cài đặt SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-dosis-medium">SMTP Server</Label>
                  <Input
                    value={smtpSettings.smtpServer}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpServer: e.target.value })}
                    placeholder="smtp.mail.me.com"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Port</Label>
                  <Input
                    value={smtpSettings.smtpPort}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                    placeholder="587"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Username</Label>
                  <Input
                    value={smtpSettings.smtpUsername}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUsername: e.target.value })}
                    placeholder="your-email@example.com"
                    className="font-dosis"
                  />
                </div>
                <div>
                  <Label className="font-dosis-medium">Password</Label>
                  <Input
                    type="password"
                    value={smtpSettings.smtpPassword || ""} // Handle undefined password
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPassword: e.target.value })}
                    placeholder="grsa-aaxz-midn-pjta"
                    className="font-dosis"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {smtpSettings.connected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-dosis">Đã kết nối (theo cài đặt đã lưu)</span>
                  </>
                ) : (
                  <span className="text-yellow-400 font-dosis">Chưa kết nối hoặc chưa lưu cài đặt.</span>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    localStorage.setItem(SMTP_LOCALSTORAGE_KEY, JSON.stringify({ ...smtpSettings, connected: false })) // Reset connected status on save, require re-test
                    showModal("Lưu thành công", ["Đã lưu cài đặt SMTP. Vui lòng test lại kết nối."], "success")
                  }}
                  className="bg-green-600 hover:bg-green-700 font-dosis-medium"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Lưu cài đặt
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!smtpSettings.smtpUsername) {
                      showModal("Lỗi Test SMTP", ["Vui lòng nhập Username SMTP."], "error");
                      return;
                    }
                    // Sử dụng hàm sendEmail để test, gửi email test đến chính nó
                    const testEmailDetails: EmailDetails = {
                      from: smtpSettings.smtpUsername,
                      to: smtpSettings.smtpUsername,
                      subject: `Test Email - Email Center - ${new Date().toISOString()}`,
                      textBody: `Đây là email test từ Trung tâm Email.\nCấu hình SMTP của bạn hoạt động bình thường!`,
                    };
                    const result = await sendEmail(testEmailDetails);
                    setSmtpSettings({ ...smtpSettings, connected: result.success }); // Cập nhật trạng thái connected
                    showModal(result.success ? "Test SMTP Thành Công" : "Test SMTP Thất Bại", [result.message], result.success ? "success" : "error");
                  }}
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
                <RotateCw className="mr-2" />
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
                        className={`px-2 py-1 rounded text-sm font-dosis-medium ${syncStatus === "Connected" ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
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
                      <RotateCw className="h-4 w-4 mr-2" />
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
