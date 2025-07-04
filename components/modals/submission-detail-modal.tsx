"use client"

import { Button } from "@/components/ui/button"
import type { Submission } from "@/types/submission"
import { X, Download, ExternalLink, Trash2 } from "lucide-react"
import { getStatusColor } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import Image from "next/image"

interface SubmissionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  submission: Submission | null
  onUpdateStatus?: (submissionId: string, newStatus: string) => void
  onUpdateSubmission?: (submissionId: string, updatedData: Partial<Submission>) => void
  onDeleteSubmission?: (submissionId: string) => void
  showModal?: (title: string, messages: string[], type?: "error" | "success") => void
  isLabelManager?: boolean
}

export function SubmissionDetailModal({
  isOpen,
  onClose,
  submission,
  onUpdateStatus,
  onUpdateSubmission,
  onDeleteSubmission,
  showModal,
  isLabelManager = false
}: Readonly<SubmissionDetailModalProps>) {
  const [upc, setUpc] = useState("")
  const [distributionLink, setDistributionLink] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Update state when submission changes
  useEffect(() => {
    if (submission) {
      setUpc(submission.upc || "")
      setDistributionLink(submission.distributionLink || "")
    }
  }, [submission])

  if (!isOpen || !submission) return null

  // Trạng thái đã phát hành (có thể chỉnh sửa UPC và distribution link)
  const isPublished = submission.status && (
    submission.status.includes("Đã phát hành") ||
    submission.status.includes("Hoàn thành phát hành")
  )

  const handleDownloadImage = () => {
    if (submission.imageUrl && submission.imageUrl.startsWith("data:")) {
      const link = document.createElement("a")
      link.href = submission.imageUrl
      link.download = `${submission.isrc}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const statuses = [
    "Đã nhận, đang chờ duyệt",
    "Đã duyệt, từ chối phát hành",
    "Đã duyệt, đang chờ phát hành!",
    "Đã phát hành, đang chờ ra mắt",
    "Hoàn thành phát hành!"
  ]

  const handleStatusChange = (newStatus: string) => {
    if (onUpdateStatus && submission) {
      onUpdateStatus(submission.id, newStatus)
      if (showModal) {
        showModal("Cập nhật thành công", [`Đã cập nhật trạng thái của "${submission.songTitle}" thành "${newStatus}"`], "success")
      }
    }
  }

  const handleSaveDistributionInfo = () => {
    if (onUpdateSubmission && submission) {
      onUpdateSubmission(submission.id, { upc, distributionLink })
      if (showModal) {
        showModal("Cập nhật thành công", ["Đã cập nhật thông tin phân phối thành công"], "success")
      }
      setIsEditing(false)
    }
  }

  const handleDeleteSubmission = () => {
    if (!submission || !onDeleteSubmission) return;

    // Xác nhận xóa (giả lập)
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài nộp "${submission.songTitle}" không?\nHành động này không thể hoàn tác.`)) {
      onDeleteSubmission(submission.id);
      onClose(); // Đóng modal sau khi xóa
    }
  };

  // Extract platforms from FFM.to link (if available)
  const MusicPlatforms = () => {
    if (!distributionLink) return null

    // Check if it's an FFM.to link
    const isFfmLink = distributionLink.includes("ffm.to") ||
      distributionLink.includes("featuredmusic.to") ||
      distributionLink.includes("feature.fm")

    if (!isFfmLink) return null

    return (
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <a href={`https://open.spotify.com/search/${encodeURIComponent(submission.songTitle)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors">
          <div className="w-5 h-5 relative">
            <Image src="/platforms/spotify.png" alt="Spotify" width={20} height={20} />
          </div>
          <span>Spotify</span>
          <ExternalLink size={12} />
        </a>
        <a href={`https://music.apple.com/search?term=${encodeURIComponent(submission.songTitle)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
          <div className="w-5 h-5 relative">
            <Image src="/platforms/apple.png" alt="Apple Music" width={20} height={20} />
          </div>
          <span>Apple Music</span>
          <ExternalLink size={12} />
        </a>
        <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(submission.songTitle + " " + submission.artistName)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors">
          <div className="w-5 h-5 relative">
            <Image src="/platforms/youtube.png" alt="YouTube" width={20} height={20} />
          </div>
          <span>YouTube</span>
          <ExternalLink size={12} />
        </a>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-gray-900/85 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-gray-800 text-gray-200 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-2xl font-semibold text-purple-400">Chi Tiết: {submission.songTitle}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">
            <X />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <p>
            <strong>ID:</strong>
            <span className="ml-2 font-light">{submission.id}</span>
          </p>
          <p>
            <strong>ISRC:</strong>
            <span className="ml-2 font-light text-green-400">{submission.isrc || "N/A"}</span>
          </p>
          {/* Thêm UPC chỉ cho Label Manager sau khi đã phát hành */}
          {isPublished && (
            <p>
              <strong>UPC:</strong>
              {isLabelManager && isEditing ? (
                <Input
                  value={upc}
                  onChange={(e) => setUpc(e.target.value)}
                  className="ml-2 inline-block w-64 h-7 bg-gray-700 border-gray-600"
                  placeholder="Nhập UPC..."
                />
              ) : (
                <span className="ml-2 font-light text-yellow-400">{submission.upc || "Chưa có"}</span>
              )}
              {isLabelManager && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-2 text-xs text-blue-400 hover:text-blue-300"
                >
                  Chỉnh sửa
                </button>
              )}
            </p>
          )}
          <p>
            <strong>Tên bài hát:</strong>
            <span className="ml-2 font-light">{submission.songTitle}</span>
          </p>
          <p>
            <strong>Nghệ sĩ chính:</strong>
            <span className="ml-2 font-light">
              {submission.artistName} (Tên thật: {submission.fullName || "N/A"}) - Vai trò: {submission.artistRole}
            </span>
          </p>
          <p>
            <strong>Người gửi:</strong>
            <span className="ml-2 font-light">
              {submission.userEmail} (Username: {submission.uploaderUsername})
            </span>
          </p>
          <p>
            <strong>Ngày gửi:</strong>
            <span className="ml-2 font-light">{submission.submissionDate}</span>
          </p>
          <p>
            <strong>Ngày phát hành:</strong>
            <span className="ml-2 font-light">
              {submission.releaseDate ? new Date(submission.releaseDate).toLocaleDateString("vi-VN") : "N/A"}
            </span>
          </p>
          <p>
            <strong>Trạng thái:</strong>
            <span
              className={`status-badge ml-2 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(submission.status)}`}
            >
              {submission.status}
            </span>

            {onUpdateStatus && (
              <Select
                value={submission.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="inline-block ml-4 w-64 h-8 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Cập nhật trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </p>

          {/* Thêm Distribution Link chỉ cho Label Manager sau khi đã phát hành */}
          {isPublished && (
            <div className="py-2 px-3 bg-gray-750 rounded-md">
              <div className="flex justify-between items-center">
                <strong>Link phân phối:</strong>
                {isLabelManager && isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveDistributionInfo}
                      className="h-7 text-xs bg-green-600 hover:bg-green-700"
                    >
                      Lưu thông tin
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      className="h-7 text-xs"
                    >
                      Hủy
                    </Button>
                  </div>
                )}
                {isLabelManager && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 text-xs"
                  >
                    Chỉnh sửa thông tin
                  </Button>
                )}
              </div>

              {isLabelManager && isEditing ? (
                <Input
                  value={distributionLink}
                  onChange={(e) => setDistributionLink(e.target.value)}
                  className="mt-2 w-full h-8 bg-gray-700 border-gray-600"
                  placeholder="Nhập FFM.to link..."
                />
              ) : distributionLink ? (
                <div className="mt-2">
                  <a
                    href={distributionLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {distributionLink} <ExternalLink size={14} />
                  </a>
                  <MusicPlatforms />
                </div>
              ) : (
                <p className="mt-2 text-gray-400 italic">Chưa có link phân phối</p>
              )}
            </div>
          )}

          <hr className="my-3 border-gray-700" />

          <div className="flex items-center justify-between">
            <p>
              <strong>Ảnh bìa:</strong>
            </p>
            <Button variant="outline" size="sm" onClick={handleDownloadImage} className="text-xs">
              <Download className="h-4 w-4 mr-1" />
              Tải xuống
            </Button>
          </div>

          {submission.imageUrl && (
            <div className="mt-2 rounded-md overflow-hidden w-full max-w-xs mx-auto">
              <div className="relative w-full aspect-square">
                <Image
                  src={
                    submission.artistName === "Various Artist"
                      ? "/placeholders/various-artist.jpg"
                      : (submission.imageUrl || "/placeholders/default-cover.jpg")
                  }
                  alt={`Cover for ${submission.songTitle}`}
                  className="object-contain rounded-lg border border-gray-600"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  onError={(e) => {
                    // Fallback to default image if loading fails
                    const target = e.target as HTMLImageElement;
                    target.src = submission.artistName === "Various Artist"
                      ? "/placeholders/various-artist.jpg"
                      : "/placeholders/default-cover.jpg";
                  }}
                />
              </div>
            </div>
          )}

          <hr className="my-3 border-gray-700" />

          <p>
            <strong>Thể loại chính:</strong>
            <span className="ml-2 font-light">{submission.mainCategory}</span>
          </p>
          {submission.subCategory && (
            <p>
              <strong>Thể loại phụ:</strong>
              <span className="ml-2 font-light">{submission.subCategory}</span>
            </p>
          )}
          <p>
            <strong>Định dạng phát hành:</strong>
            <span className="ml-2 font-light">
              {submission.releaseType} ({submission.audioFilesCount} track)
            </span>
          </p>
          <p>
            <strong>Tên file ảnh bìa:</strong>
            <span className="ml-2 font-light">{submission.imageFile}</span>
          </p>
          <p>
            <strong>Bản quyền:</strong>
            <span className="ml-2 font-light">
              {submission.isCopyrightOwner === "yes" ? "Chính chủ" : "Cover/Remix"}
            </span>
          </p>
          <p>
            <strong>Đã phát hành trước đó:</strong>
            <span className="ml-2 font-light">{submission.hasBeenReleased === "yes" ? "Rồi" : "Chưa"}</span>
          </p>

          {submission.hasBeenReleased === "yes" && submission.platforms && submission.platforms.length > 0 && (
            <p>
              <strong>Nền tảng đã phát hành:</strong>
              <span className="ml-2 font-light">{submission.platforms.join(", ")}</span>
            </p>
          )}

          <p>
            <strong>Có lời:</strong>
            <span className="ml-2 font-light">{submission.hasLyrics === "yes" ? "Có" : "Không"}</span>
          </p>

          {submission.hasLyrics === "yes" && submission.lyrics && (
            <div className="mt-2 p-3 bg-gray-750 rounded-md">
              <strong className="block mb-1 text-gray-400">Lời bài hát:</strong>
              <pre className="whitespace-pre-wrap text-xs font-light">{submission.lyrics}</pre>
            </div>
          )}

          {submission.additionalArtists && submission.additionalArtists.length > 0 && (
            <>
              <hr className="my-3 border-gray-700" />
              <p>
                <strong>Nghệ sĩ hợp tác:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 font-light">
                {submission.additionalArtists.map((artist, index) => (
                  <li key={index}>
                    {artist.name} (Vai trò: {artist.role}, Tên thật: {artist.fullName || "N/A"})
                  </li>
                ))}
              </ul>
            </>
          )}

          {submission.trackInfos && submission.trackInfos.length > 0 && (
            <>
              <hr className="my-3 border-gray-700" />
              <p>
                <strong>Chi tiết từng track:</strong>
              </p>
              <div className="space-y-2">
                {submission.trackInfos.map((track, index) => (
                  <div key={index} className="p-2 bg-gray-700 rounded">
                    <p className="text-xs">
                      <strong>Track {index + 1}:</strong> {track.songTitle || track.fileName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Nghệ sĩ: {track.artistName} ({track.artistFullName})
                    </p>
                    {track.additionalArtists && track.additionalArtists.length > 0 && (
                      <p className="text-xs text-gray-400">
                        Hợp tác: {track.additionalArtists.map((a) => a.name).join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {submission.notes && (
            <>
              <hr className="my-3 border-gray-700" />
              <p>
                <strong>Ghi chú:</strong>
                <span className="ml-2 font-light">{submission.notes}</span>
              </p>
            </>
          )}

          <hr className="my-3 border-gray-700" />

          {submission.audioUrl && (
            <div className="my-3">
              <strong>Nghe thử nhạc:</strong>
              <audio controls src={submission.audioUrl} className="w-full mt-2">
                Trình duyệt của bạn không hỗ trợ audio.
              </audio>
            </div>
          )}

          <div className="mt-4">
            <strong className="block mb-2">Cập nhật trạng thái:</strong>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status, index) => (
                <Button
                  key={index}
                  variant={submission.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  className="text-xs rounded-full"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} className="flex-1 rounded-full bg-purple-600 hover:bg-purple-700">
            <X className="h-5 w-5 mr-2" />
            Đóng
          </Button>

          {isLabelManager && onDeleteSubmission && (
            <Button
              onClick={handleDeleteSubmission}
              className="rounded-full bg-red-600 hover:bg-red-700"
              variant="destructive"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Xóa
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
