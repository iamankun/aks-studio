// Tôi là An Kun
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchSubmissionsFromClient, saveSubmissionsToClient } from "@/lib/data"
import type { User } from "@/types/user"
import AksData from "@/app/data" // Import the AksData component
import type { Submission } from "@/types/submission"
import {
    Users,
    Music,
    Database,
    Settings,
    Save,
    Download,
    Upload,
    Search,
    FileDown,
} from "lucide-react"
import { getStatusColor } from "@/lib/utils"

interface AdminPanelViewProps {
    showModal: (title: string, messages: string[], type?: "error" | "success") => void
    currentUser: User
}

export function AdminPanelView({ showModal, currentUser }: AdminPanelViewProps) {
    const [submissionsList, setSubmissionsList] = useState<Submission[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const dbSubs = await fetchSubmissionsFromClient()
        setSubmissionsList(dbSubs)
    }

    const saveData = () => {
        try {
            saveSubmissionsToClient(submissionsList)
            showModal("Lưu thành công", ["Đã lưu danh sách bài hát."], "success")
        } catch (error) {
            console.error("Error saving submissions:", error)
            showModal("Lỗi", ["Không thể lưu danh sách bài hát."], "error")
        }
    }

    const exportData = () => {
        const data = {
            submissions: submissionsList,
            exportDate: new Date().toISOString(),
            version: "1.0.0-beta",
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `music-hub-backup-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showModal("Xuất dữ liệu", ["Đã tải file backup bài hát thành công"], "success")
    }

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string)

                if (data.submissions) {
                    setSubmissionsList(data.submissions)
                    showModal("Nhập dữ liệu", ["Đã khôi phục dữ liệu bài hát thành công"], "success")
                } else {
                    showModal("Lỗi nhập dữ liệu", ["File không đúng định dạng"], "error")
                }
            } catch (error) {
                showModal("Lỗi nhập dữ liệu", ["Không thể đọc file JSON"], "error")
            }
        }
        reader.readAsText(file)
    }

    const downloadSubmissionFile = (submission: Submission, type: "audio" | "image") => {
        // In a real app, this would download the actual file
        // For demo, we'll show a message
        showModal(
            "Tải xuống",
            [`Đang tải ${type === "audio" ? "File Audio" : "Art Cover"} của "${submission.songTitle}"`],
            "success",
        )
    }

    const isLabelManager = currentUser.role === "Label Manager";
    const defaultTab = isLabelManager ? "data-management" : "submissions";

    return (
        <div className="p-6 font-dosis">
            <h2 className="text-3xl font-dosis-bold text-white mb-6 flex items-center">
                <Settings className="mr-3 text-purple-400" />
                Quản trị hệ thống
            </h2>

            <Tabs defaultValue={defaultTab} className="space-y-6">
                <TabsList className={`grid w-full ${isLabelManager ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <TabsTrigger value="submissions" className="font-dosis-medium">
                        Bài hát
                    </TabsTrigger>
                    <TabsTrigger value="isrc" className="font-dosis-medium">
                        ISRC Lookup
                    </TabsTrigger>
                    {isLabelManager && (
                        <TabsTrigger value="data-management" className="font-dosis-medium">
                            Quản lý thư mục
                        </TabsTrigger>
                    )}
                </TabsList>

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
                                Tìm kiếm ISRC
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
                {isLabelManager && (
                    <TabsContent value="data-management" className="space-y-6">
                        <AksData currentUser={currentUser} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
// Tôi là An Kun
