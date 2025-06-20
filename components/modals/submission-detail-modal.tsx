"use client"

import { Button } from "@/components/ui/button"
import type { Submission } from "@/types/submission"
import { X, Download } from "lucide-react"
import { getStatusColor } from "@/lib/utils"

interface SubmissionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  submission: Submission | null
}

export function SubmissionDetailModal({ isOpen, onClose, submission }: SubmissionDetailModalProps) {
  if (!isOpen || !submission) return null

  const handleDownloadImage = () => {
    if (submission.imageUrl && submission.imageUrl.startsWith("data:")) {
      const link = document.createElement("a")
      link.href = submission.imageUrl
      link.download = `${submission.songTitle}_cover.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
          </p>

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
          <img
            src={submission.imageUrl || "https://placehold.co/200x200/1f2937/4b5563?text=Art"}
            alt="Cover Art Detail"
            className="my-2 rounded-lg max-w-xs w-full object-cover border border-gray-600"
          />

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
        </div>

        <Button onClick={onClose} className="mt-6 w-full rounded-full bg-purple-600 hover:bg-purple-700">
          <X className="h-5 w-5 mr-2" />
          Đóng
        </Button>
      </div>
    </div>
  )
}
