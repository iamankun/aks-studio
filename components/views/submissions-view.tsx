"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmissionDetailModal } from "@/components/modals/submission-detail-modal"
import { useAuth } from "@/components/auth-provider"
import { AuthorizationService } from "@/lib/authorization-service"
import type { Submission } from "@/types/submission"
import { getStatusColor, getStatusText } from "@/types/submission"
import { Eye, Download, Volume2, FileText, Music, Upload, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"

interface SubmissionsViewProps {
  submissions: Submission[]
  viewType: string
  onUpdateStatus: (submissionId: string, newStatus: string) => void
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
  onViewChange?: (view: string) => void
}

export function SubmissionsView({
  viewType,
  onUpdateStatus,
  showModal,
  onViewChange,
  submissions,
}: Readonly<SubmissionsViewProps>) {
  const { user: currentUser } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") // Thêm state tìm kiếm

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

  // Lọc submissions theo từ khóa tìm kiếm
  const filteredDisplaySubmissions = displaySubmissions.filter(submission => {
    if (!searchTerm) return true;
    const searchText = searchTerm.toLowerCase();

    // Safely convert any property to string before checking
    const safeIncludes = (value: string | number | undefined | null): boolean => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchText);
    };

    return (
      safeIncludes(submission.artistName) ||
      safeIncludes(submission.songTitle) ||
      safeIncludes(submission.albumName) ||
      safeIncludes(submission.id) ||
      safeIncludes(submission.isrc) ||
      safeIncludes(submission.status)
    );
  });

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

  // Xử lý xóa submission
  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      console.log(`Đang xóa submission ${submissionId}`);

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Cập nhật state local sau khi xóa thành công
        // Note: Có thể cần reload toàn bộ danh sách nếu được quản lý bởi component cha
        showModal("Xóa thành công", [`Đã xóa bài nộp "${selectedSubmission?.songTitle || ''}" thành công`], "success");
        setIsDetailModalOpen(false); // Đóng modal
        setSelectedSubmission(null); // Xóa submission đã chọn
      } else {
        showModal("Lỗi xóa bài nộp", [data.message || "Không thể xóa bài nộp"], "error");
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      showModal("Lỗi xóa bài nộp", ["Đã xảy ra lỗi khi thực hiện xóa bài nộp"], "error");
    }
  };

  const statuses = [
    "Đã nhận, đang chờ duyệt",
    "Đã duyệt, từ chối phát hành",
    "Đã duyệt, đang chờ phát hành!",
    "Đã phát hành, đang chờ ra mắt",
    "Hoàn thành phát hành!",
  ]

  // Nếu là Label Manager thì xem toàn bộ, còn artist chỉ xem số liệu của mình
  const isLabelManager = currentUser.role === "Label Manager";
  const filteredSubmissions = isLabelManager
    ? submissions
    : submissions.filter((sub) => sub.uploaderUsername === currentUser.username);

  // Tính toán các số liệu thống kê
  const totalSubmissions = filteredSubmissions.length;

  // Đã duyệt (status === "Đã duyệt, đang chờ phát hành!" hoặc "Hoàn thành phát hành!" hoặc "Đã phát hành, đang chờ ra mắt")
  const approvedSubmissions = filteredSubmissions.filter((sub) => [
    "Đã duyệt, đang chờ phát hành!",
    "Hoàn thành phát hành!",
    "Đã phát hành, đang chờ ra mắt"
  ].includes(sub.status)).length;

  // Chờ duyệt (status === "Đã nhận, đang chờ duyệt")
  const pendingSubmissions = filteredSubmissions.filter((sub) => sub.status === "Đã nhận, đang chờ duyệt").length;

  // Từ chối phát hành (status === "Đã duyệt, từ chối phát hành")
  const rejectedSubmissions = filteredSubmissions.filter((sub) => sub.status === "Đã duyệt, từ chối phát hành").length;

  // Đang phát hành (status === "Đã phát hành, đang chờ ra mắt")
  const inProgressSubmissions = filteredSubmissions.filter((sub) => sub.status === "Đã phát hành, đang chờ ra mắt").length;

  // Hoàn thành phát hành (status === "Hoàn thành phát hành!")
  const completedSubmissions = filteredSubmissions.filter((sub) => sub.status === "Hoàn thành phát hành!").length;

  // Tổng số track (trackInfos)
  const totalTracks = filteredSubmissions.reduce((sum, sub) => {
    return sum + (Array.isArray(sub.trackInfos) ? sub.trackInfos.length : 0);
  }, 0);

  // Tổng số audio (audioUrls hoặc audioUrl)
  const totalAudios = filteredSubmissions.reduce((sum, sub) => {
    const audioCount = Array.isArray(sub.audioUrls)
      ? sub.audioUrls.length
      : (sub.audioUrl ? 1 : 0);
    return sum + audioCount;
  }, 0);

  // Tổng hợp thông tin submissions theo thể loại
  const submissionsByCategory = filteredSubmissions.reduce((acc, sub) => {
    const category = sub.mainCategory || 'other_main';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);

  // Tổng hợp thông tin submissions theo nền tảng
  const submissionsByPlatform = filteredSubmissions.reduce((acc, sub) => {
    if (Array.isArray(sub.platforms)) {
      sub.platforms.forEach(platform => {
        if (!acc[platform]) {
          acc[platform] = 0;
        }
        acc[platform]++;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  // Chuyển đổi định dạng ngày cho submissions
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Hàm chuyển đổi mã thể loại thành tên hiển thị
  const getCategoryName = (categoryCode: string): string => {
    const categoryNames: Record<string, string> = {
      'pop': 'Pop',
      'singer-songwriter': 'Singer-Songwriter',
      'hiphoprap': 'Hip Hop/Rap',
      'edm': 'EDM',
      'rnb': 'R&B',
      'ballad': 'Ballad',
      'acoustic': 'Acoustic',
      'indie': 'Indie',
      'other_main': 'Khác'
    };
    return categoryNames[categoryCode] || categoryCode;
  };

  // Hàm chuyển đổi mã nền tảng thành tên hiển thị
  const getPlatformName = (platformCode: string): string => {
    const platformNames: Record<string, string> = {
      'youtube': 'YouTube',
      'spotify': 'Spotify',
      'apple_music': 'Apple Music',
      'soundcloud': 'SoundCloud',
      'other_platform': 'Khác'
    };
    return platformNames[platformCode] || platformCode;
  };

  // Handle updating submission data (for UPC and distribution link)
  const handleUpdateSubmission = async (submissionId: string, updatedData: Partial<Submission>) => {
    try {
      console.log(`Sending update for submission ${submissionId}:`, updatedData);

      // Chỉ gửi UPC và distributionLink để tránh lỗi với dữ liệu lớn
      const dataToSend = {
        upc: updatedData.upc,
        distributionLink: updatedData.distributionLink
      };

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Cập nhật lại submission trong state local
        // Note: submissions state might be managed by parent component, so we don't update it directly

        // Cập nhật selectedSubmission nếu đang được xem
        if (selectedSubmission && selectedSubmission.id === submissionId) {
          setSelectedSubmission({ ...selectedSubmission, ...dataToSend });
        }

        showModal("Cập nhật thành công", ["Thông tin phân phối đã được cập nhật thành công"], "success");
      } else {
        showModal("Lỗi cập nhật", [data.error || "Không thể cập nhật thông tin"], "error");
      }
    } catch (error) {
      console.error("Error updating submission:", error);
      const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật thông tin";
      showModal("Lỗi cập nhật", [errorMessage], "error");
    }
  };

  // Handler functions for new authorization-based actions
  const handleEditSubmission = (submission: Submission) => {
    // For now, just open the detail modal in edit mode
    // In a full implementation, this would open an edit form
    setSelectedSubmission(submission)
    setIsDetailModalOpen(true)
    showModal("Chỉnh sửa bài nộp", [`Mở form chỉnh sửa cho "${submission.songTitle}"`], "success")
  }

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await fetch('/api/submissions/approve-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action: 'approve',
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the submission status locally
        onUpdateStatus(submissionId, 'approved')
        showModal("Duyệt thành công", ["Bài nộp đã được duyệt"], "success")
      } else {
        showModal("Lỗi duyệt bài", [data.message || "Không thể duyệt bài nộp"], "error")
      }
    } catch (error) {
      console.error("Error approving submission:", error)
      showModal("Lỗi duyệt bài", ["Đã xảy ra lỗi khi duyệt bài nộp"], "error")
    }
  }

  const handleRejectSubmission = async (submissionId: string) => {
    // For now, reject without comment. In full implementation, would show a comment dialog
    const comment = prompt("Nhập lý do từ chối (tùy chọn):")

    try {
      const response = await fetch('/api/submissions/approve-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action: 'reject',
          comment: comment || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the submission status locally
        onUpdateStatus(submissionId, 'rejected')
        showModal("Từ chối thành công", ["Bài nộp đã bị từ chối"], "success")
      } else {
        showModal("Lỗi từ chối bài", [data.message || "Không thể từ chối bài nộp"], "error")
      }
    } catch (error) {
      console.error("Error rejecting submission:", error)
      showModal("Lỗi từ chối bài", ["Đã xảy ra lỗi khi từ chối bài nộp"], "error")
    }
  }

  return (
    <div className="p-2 md:p-6">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submissions</h1>
          <p className="text-gray-600">Quản lý các bài nhạc bạn đã gửi lên hệ thống</p>
        </div>
        <div className="w-full md:w-64">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm submissions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setSearchTerm("")}
            >
              {searchTerm ? "×" : "🔍"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tổng submissions</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalSubmissions}</div>
            <p className="text-xs text-gray-400">Tổng số bài gửi lên</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Đã duyệt</CardTitle>
            <Music className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{approvedSubmissions}</div>
            <p className="text-xs text-gray-400">Sẵn sàng phát hành</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Chờ duyệt</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingSubmissions}</div>
            <p className="text-xs text-gray-400">Đang chờ kiểm duyệt</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Bị từ chối</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{rejectedSubmissions}</div>
            <p className="text-xs text-gray-400">Đã bị từ chối phát hành</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Đang phát hành</CardTitle>
            <Volume2 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{inProgressSubmissions}</div>
            <p className="text-xs text-gray-400">Đang chờ ra mắt</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Hoàn thành phát hành</CardTitle>
            <Music className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedSubmissions}</div>
            <p className="text-xs text-gray-400">Đã hoàn thành phát hành</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tổng số track</CardTitle>
            <Music className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalTracks}</div>
            <p className="text-xs text-gray-400">Các track đã gửi</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tổng file âm thanh</CardTitle>
            <Music className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalAudios}</div>
            <p className="text-xs text-gray-400">Các file âm thanh đã gửi</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-gray-800 border border-gray-700">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="mr-3 text-purple-400 w-8 h-8" />
            <div>
              <CardTitle className="text-white">
                {searchTerm ? "Kết quả tìm kiếm" : "Danh sách submissions"}
              </CardTitle>
              {searchTerm && (
                <p className="text-xs text-gray-400 mt-1">
                  Tìm thấy {filteredDisplaySubmissions.length} kết quả cho &ldquo;{searchTerm}&rdquo;
                </p>
              )}
            </div>
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
          {filteredDisplaySubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm ? "Không tìm thấy submissions khớp với từ khóa" : "Không tìm thấy submissions nào"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm ? "Thử tìm với từ khóa khác" : "Tải lên bài hát đầu tiên của bạn để bắt đầu"}
              </p>
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
                    {filteredDisplaySubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-750 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-green-400">{submission.isrc || "N/A"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-purple-400">{submission.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border border-gray-600">
                              <Image
                                src={
                                  submission.artistName === "Various Artist"
                                    ? "/placeholders/various-artist.jpg"
                                    : (submission.imageUrl || "/placeholders/default-cover.jpg")
                                }
                                alt="Cover"
                                width={40}
                                height={40}
                                className="h-10 w-10 object-cover"
                                style={{ objectPosition: 'center' }}
                                unoptimized={submission.imageUrl?.startsWith("data:")}
                                onError={(e) => {
                                  // Fallback to default image if loading fails
                                  const target = e.target as HTMLImageElement;
                                  target.src = submission.artistName === "Various Artist"
                                    ? "/placeholders/various-artist.jpg"
                                    : "/placeholders/default-cover.jpg";
                                }}
                              />
                            </div>
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
                          <div className="flex flex-col gap-1">
                            {/* Nếu là album/ep có nhiều bài, hiển thị từng player */}
                            {Array.isArray(submission.audioUrls) && submission.audioUrls.length > 0 ? (
                              submission.audioUrls.map((url, idx) => (
                                <div key={url} className="flex items-center space-x-2">
                                  <audio controls src={url} className="h-8" preload="none" style={{ maxWidth: 180 }} />
                                  <span className="text-xs text-gray-400">Track {idx + 1}</span>
                                </div>
                              ))
                            ) : submission.audioUrl ? (
                                <div className="flex items-center space-x-2">
                                  <audio controls src={submission.audioUrl} className="h-8" preload="none" style={{ maxWidth: 180 }} />
                                  <span className="text-xs text-gray-400">Single</span>
                                </div>
                            ) : (
                                  <span className="text-xs text-gray-500">Không có audio</span>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
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
                        </div>
                      </td>
                      <td className="px-4 py-3">
                          <span className="text-sm text-gray-400">{formatDate(submission.submissionDate)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">
                            {submission.releaseDate ? formatDate(submission.releaseDate) : "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                          <span className={`status-badge ${getStatusColor(submission.status)}`}>
                            {getStatusText(submission.status)}
                          </span>
                      </td>
                      <td className="px-4 py-3 text-sm space-x-2 whitespace-nowrap">
                          {/* View button - everyone can view */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(submission.id)}
                          className="text-xs"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                          </Button>                        {/* Edit button - only for artists editing their own submissions in pending status, or label managers */}
                          {(AuthorizationService.canEditSubmission(currentUser, {
                            id: submission.id,
                            track_title: submission.songTitle,
                            artist_name: submission.artistName,
                            user_id: submission.userId,
                            genre: submission.mainCategory || 'pop',
                            submission_date: submission.submissionDate,
                            status: 'pending' // Default to pending for authorization check
                          }).allowed) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSubmission(submission)}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Sửa
                              </Button>
                            )}

                          {/* Delete button - only for label managers */}
                          {AuthorizationService.canDeleteSubmission(currentUser).allowed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSubmission(submission.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          )}

                          {/* Approve/Reject buttons - only for label managers */}
                          {AuthorizationService.canApproveRejectSubmission(currentUser).allowed && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveSubmission(submission.id)}
                                className="text-xs text-green-400 hover:text-green-300"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectSubmission(submission.id)}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Hủy
                              </Button>
                            </>
                          )}

                          {/* Status selector for label managers */}
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

      {/* Card hiển thị phân tích theo thể loại */}
      {Object.keys(submissionsByCategory).length > 0 && (
        <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Phân loại theo thể loại</CardTitle>
            <FileText className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(submissionsByCategory).map(([category, count]) => (
                <div key={category} className="px-2 py-1 bg-gray-700 rounded-md text-xs">
                  <span className="font-semibold">{getCategoryName(category)}</span>: {count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card hiển thị phân tích theo nền tảng */}
      {Object.keys(submissionsByPlatform).length > 0 && (
        <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Phân loại theo nền tảng</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(submissionsByPlatform).map(([platform, count]) => (
                <div key={platform} className="px-2 py-1 bg-gray-700 rounded-md text-xs">
                  <span className="font-semibold">{getPlatformName(platform)}</span>: {count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSubmission && (
        <SubmissionDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          submission={selectedSubmission}
          onUpdateStatus={onUpdateStatus}
          onUpdateSubmission={handleUpdateSubmission}
          showModal={showModal}
          isLabelManager={isLabelManager}
          onDeleteSubmission={handleDeleteSubmission}
        />
      )}
    </div>
  )
}
