"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchSubmissionsFromClient } from "@/lib/data"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import {
  Music,
  Database,
  Settings,
  Save,
  Download,
  Search,
  FileDown,
  Shield,
  Folder,
  Key,
  HardDrive,
} from "lucide-react"
import { getStatusColor } from "@/lib/utils"
import { SUPABASE_CONFIG } from "@/lib/supabase-config"

interface AdminPanelViewProps {
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
  currentUser: User
}

export default function AdminPanelView({ showModal, currentUser }: AdminPanelViewProps) {
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([])
  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: "0 MB",
    audioFiles: 0,
    imageFiles: 0,
  })

  const isLabelManager = currentUser?.role === "Label Manager"

  useEffect(() => {
    if (isLabelManager) {
      loadData()
      loadStorageStats()
    }
  }, [isLabelManager])

  const loadData = async () => {
    const dbSubs = await fetchSubmissionsFromClient()
    setSubmissionsList(dbSubs)
  }

  const loadStorageStats = async () => {
    // Simulate storage stats - in real app, fetch from Supabase
    setStorageStats({
      totalFiles: submissionsList.length * 2, // Audio + Image per submission
      totalSize: `${(submissionsList.length * 15).toFixed(1)} MB`,
      audioFiles: submissionsList.length,
      imageFiles: submissionsList.length,
    })
  }

  const exportData = () => {
    const data = {
      submissions: submissionsList,
      storageConfig: SUPABASE_CONFIG.storage,
      exportDate: new Date().toISOString(),
      version: "1.2.0-beta",
      databaseSchema: "supabase-vaxffiiwwwqfnjehleec",
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aks-studio-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showModal("Xuất dữ liệu", ["Đã tải file backup thành công"], "success")
  }

  const downloadSubmissionFile = (submission: Submission, type: "audio" | "image") => {
    const bucket = type === "audio" ? "audio-files" : "cover-images"
    const fileName = type === "audio" ? submission.audioUrl : submission.imageUrl
    showModal(
      "Tải xuống",
      [`Đang tải ${type === "audio" ? "File Audio" : "Art Cover"} của "${submission.songTitle}" từ bucket: ${bucket}`],
      "success",
    )
  }

  if (!isLabelManager) {
    return (
      <div className="p-6 font-dosis">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-dosis-bold text-white mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-400 mb-4">Bạn cần quyền Label Manager để truy cập trang này.</p>
            <p className="text-sm text-gray-500">Role hiện tại: {currentUser?.role || "Không xác định"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 font-dosis">
      <h2 className="text-3xl font-dosis-bold text-white mb-6 flex items-center">
        <Settings className="mr-3 text-purple-400" />
        Admin Panel - Label Manager
      </h2>

      <Tabs defaultValue="folder-management" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="folder-management" className="font-dosis-medium">
            <Folder className="h-4 w-4 mr-2" />
            Quản lý thư mục
          </TabsTrigger>
          <TabsTrigger value="submissions" className="font-dosis-medium">
            <Music className="h-4 w-4 mr-2" />
            Bài hát
          </TabsTrigger>
          <TabsTrigger value="isrc" className="font-dosis-medium">
            <Search className="h-4 w-4 mr-2" />
            ISRC Lookup
          </TabsTrigger>
          <TabsTrigger value="database" className="font-dosis-medium">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
        </TabsList>

        {/* Folder Management */}
        <TabsContent value="folder-management" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Storage Configuration */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center font-dosis-semibold">
                  <Key className="mr-2" />
                  Storage Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">S3 Endpoint</Label>
                  <Input
                    value={SUPABASE_CONFIG.storage.endpoint}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Region</Label>
                  <Input
                    value={SUPABASE_CONFIG.storage.region}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Access Key</Label>
                  <Input
                    value={`${SUPABASE_CONFIG.storage.accessKey.substring(0, 8)}...`}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Storage Stats */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center font-dosis-semibold">
                  <HardDrive className="mr-2" />
                  Storage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Files:</span>
                  <span className="text-white font-semibold">{storageStats.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Size:</span>
                  <span className="text-white font-semibold">{storageStats.totalSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Audio Files:</span>
                  <span className="text-white font-semibold">{storageStats.audioFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Image Files:</span>
                  <span className="text-white font-semibold">{storageStats.imageFiles}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bucket Management */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center font-dosis-semibold">
                <Folder className="mr-2" />
                Bucket Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(SUPABASE_CONFIG.storage.buckets).map(([key, bucket]) => (
                  <Card key={key} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <h3 className="font-dosis-semibold text-white mb-2">{bucket}</h3>
                      <p className="text-gray-400 text-sm mb-3">Bucket: {key}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => showModal("Bucket Info", [`Accessing bucket: ${bucket}`], "success")}
                      >
                        <Folder className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
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
                            <h3 className="font-dosis-semibold text-white">{submission.songTitle || "No title"}</h3>
                            <p className="text-gray-400 font-dosis">{submission.artistName || "No artist"}</p>
                            <p className="text-gray-500 text-sm font-dosis">
                              ID: {submission.id || "N/A"} | ISRC: {submission.isrc || "N/A"}
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
                            <p className="text-sm text-gray-400 font-dosis">{submission.submissionDate || ""}</p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-dosis-medium ${getStatusColor(submission.status || "")}`}
                            >
                              {submission.status || "N/A"}
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
                ISRC Lookup Tool
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center font-dosis-semibold">
                  <Database className="mr-2" />
                  Database Schema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src="/database-schema.png"
                  alt="Database Schema"
                  className="w-full h-auto rounded-lg border border-gray-600"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center font-dosis-semibold">
                  <Save className="mr-2" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportData} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Backup
                </Button>
                <div className="text-sm text-gray-400">
                  <p>Database: vaxffiiwwwqfnjehleec</p>
                  <p>Tables: users, submissions, tracks, submission_artists</p>
                  <p>Storage: S3 Compatible (ap-southeast-1)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
