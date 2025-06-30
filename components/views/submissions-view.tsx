"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmissionDetailModal } from "@/components/modals/submission-detail-modal"
import { useAuth } from "@/components/auth-provider"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import { Eye, Download, Play, Pause, Volume2, FileText, Music, Upload } from "lucide-react"

interface SubmissionsViewProps {
  submissions: Submission[]
  viewType: string
  onUpdateStatus: (submissionId: string, newStatus: string) => void
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
  onViewChange?: (view: string) => void
}

export function SubmissionsView({
  submissions,
  viewType,
  onUpdateStatus,
  showModal,
  onViewChange,
}: SubmissionsViewProps) {
  const { user: currentUser } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)

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

  const displaySubmissions =
    viewType === "mySubmissions"
      ? submissions.filter((sub) => sub.uploaderUsername === currentUser.username)
      : submissions

  const handleViewDetails = (submissionId: string) => {
    const submission = submissions.find((s) => s.id === submissionId)
    if (submission) {
      setSelectedSubmission(submission)
      setIsDetailModalOpen(true)
    }
  }

  const handleDownloadImage = (submission: Submission) => {
    if (submission.imageUrl && submission.imageUrl.startsWith("data:")) {
      const link = document.createElement("a")
      link.href = submission.imageUrl
      link.download = `${submission.songTitle}_cover.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showModal("Tải Xuống Thành Công", [`Đã tải ảnh bìa "${submission.songTitle}"`], "success")
    } else {
      showModal("Thông Báo", ["Không thể tải xuống ảnh bìa."], "error")
    }
  }

  const handleDownloadAudio = (submission: Submission) => {
    // In a real app, this would download the actual audio files
    showModal(
      "Tải Xuống Audio",
      [
        `Đang chuẩn bị tải ${submission.audioFilesCount} file audio cho "${submission.songTitle}". Tính năng đang phát triển.`,
      ],
      "success",
    )
  }

  const handlePlayAudio = (submissionId: string) => {
    if (playingAudio === submissionId) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(submissionId)
      // Simulate audio playback
      setTimeout(() => setPlayingAudio(null), 5000) // Auto stop after 5 seconds for demo
    }
  }

  const statuses = [
    "Đã nhận, đang chờ duyệt",
    "Đã duyệt, từ chối phát hành",
    "Đã duyệt, đang chờ phát hành!",
    "Đã phát hành, đang chờ ra mắt",
    "Hoàn thành phát hành!",
  ]

  const totalSubmissions = submissions.length
  const approvedSubmissions = submissions.filter((sub) => sub.status === "approved").length // Tôi là An Kun
  const pendingSubmissions = submissions.filter((sub) => sub.status === "pending").length // Tôi là An Kun

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Submissions</h1>
        <p className="text-gray-400">Manage your music submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSubmissions}</div>
            <p className="text-xs text-gray-400">No submissions yet</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Approved</CardTitle>
            <Music className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approvedSubmissions}</div>
            <p className="text-xs text-gray-400">Ready for release</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingSubmissions}</div>
            <p className="text-xs text-gray-400">Under review</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-gray-800 border border-gray-700">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="mr-3 text-purple-400 w-8 h-8" />
            <CardTitle className="text-white">Recent Submissions</CardTitle>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => onViewChange?.("upload")}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload New Track
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {displaySubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No submissions found</p>
              <p className="text-sm text-gray-500 mt-2">Upload your first track to get started</p>
              <Button
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => onViewChange?.("upload")}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Track
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      ISRC
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Ảnh Bìa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Nghệ Sĩ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Tên Bài Hát
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Audio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Ngày Gửi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Ngày Phát Hành
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {displaySubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-green-400">{submission.isrc || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-purple-400">{submission.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={submission.imageUrl || "https://placehold.co/40x40/1f2937/4b5563?text=Art"}
                            alt="Cover"
                            className="h-10 w-10 object-cover rounded-md border border-gray-600"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadImage(submission)}
                            className="p-1"
                            title="Tải xuống ảnh bìa"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-200 font-medium">{submission.artistName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-300">{submission.songTitle}</span>
                        <p className="text-xs text-gray-500">{submission.audioFilesCount} track(s)</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayAudio(submission.id)}
                            className="p-1"
                            title="Nghe thử"
                          >
                            {playingAudio === submission.id ? (
                              <Pause className="h-4 w-4 text-green-400" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadAudio(submission)}
                            className="p-1"
                            title="Tải xuống audio"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{submission.submissionDate}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">
                          {submission.releaseDate
                            ? new Date(submission.releaseDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${getStatusColor(submission.status)}`}>{submission.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(submission.id)}
                          className="text-xs"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>

                        {currentUser.role === "Label Manager" && (
                          <Select
                            value={submission.status}
                            onValueChange={(newStatus) => onUpdateStatus(submission.id, newStatus)}
                          >
                            <SelectTrigger className="w-auto text-xs py-1.5 h-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status} value={status} className="text-xs">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSubmission && (
        <SubmissionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          submission={selectedSubmission}
        />
      )}
    </div>
  )
}
