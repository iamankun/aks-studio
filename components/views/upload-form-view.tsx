"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { User } from "@/types/user"
import type { Submission, TrackInfo, AdditionalArtist } from "@/types/submission"
import {
  Rocket,
  UserIcon,
  Disc3,
  UploadIcon,
  Copyright,
  Calendar,
  Eye,
  EyeOff,
  X,
  GripVertical,
  Play,
  Pause,
  Plus,
  Trash2,
  FileText,
  Mail,
} from "lucide-react";
import { generateISRC, validateImageFile, validateAudioFile, getMinimumReleaseDate } from "@/lib/utils";

// Định nghĩa các kiểu dữ liệu cụ thể cho các trường trong form
// Điều này giúp TypeScript hiểu rõ các giá trị hợp lệ và tránh lỗi "string is not assignable"
type ArtistRole = "singer" | "composer" | "singersongwriter" | "rapper" | "producer" | "singer-songwriter" | "instrumentalist"
type MainCategory = "pop" | "singer-songwriter" | "hiphoprap" | "edm" | "rnb" | "ballad" | "acoustic" | "indie" | "other_main"
type SubCategory = "official" | "cover" | "vpop" | "lofi" | "chill" | "trap" | "house" | "alternative" | "folk" | "other_sub" | ""
type ReleaseType = "single" | "ep" | "lp" | "album"
type YesNo = "yes" | "no"

interface UploadFormViewProps {
  currentUser: User;
  onSubmissionAddedAction: (submission: Submission) => void;
  showModalAction: (title: string, messages: string[], type?: "error" | "success") => void;
}
export default function UploadFormView({ currentUser, onSubmissionAddedAction, showModalAction }: UploadFormViewProps) {
  // Form state
  const [fullName, setFullName] = useState(currentUser.fullName || "")
  const [artistName, setArtistName] = useState(currentUser.role === "Artist" ? currentUser.username : "")
  const [artistRole, setArtistRole] = useState<ArtistRole | "">("")
  const [songTitle, setSongTitle] = useState("")
  const [mainCategory, setMainCategory] = useState<MainCategory | "">("")
  const [subCategory, setSubCategory] = useState<SubCategory | "">("")
  const [releaseType, setReleaseType] = useState<ReleaseType | "">("")
  const [albumName, setAlbumName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioTracks, setAudioTracks] = useState<{ file: File; info: TrackInfo; id: string }[]>([])
  const [isCopyrightOwner, setIsCopyrightOwner] = useState<YesNo | "">("")
  const [hasBeenReleased, setHasBeenReleased] = useState<YesNo | "">("")
  const [platforms, setPlatforms] = useState<string[]>([])
  const [hasLyrics, setHasLyrics] = useState<YesNo | "">("")
  const [lyrics, setLyrics] = useState("")
  const [userEmail, setUserEmail] = useState(currentUser.email || "")
  const [notes, setNotes] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [formActiveTab, setFormActiveTab] = useState("info")

  // Preview state
  const [imagePreviewUrl, setImagePreviewUrl] = useState("/face.png")
  const [showPreview, setShowPreview] = useState(false)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ISRC counter
  const [lastISRCCounter, setLastISRCCounter] = useState(18)

  useEffect(() => {
    // Load ISRC counter from localStorage
    const stored = localStorage.getItem("lastISRCCounter_v3")
    if (stored) {
      setLastISRCCounter(Number.parseInt(stored, 10))
    }

    // Set minimum release date
    setReleaseDate(getMinimumReleaseDate())
  }, [])

  // Effect for album name based on release type
  useEffect(() => {
    if (releaseType === "single" && songTitle) {
      setAlbumName(`${songTitle} - Single`)
    }
  }, [releaseType, songTitle])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setImagePreviewUrl("/dianhac.jpg")
      return
    }

    const validation = await validateImageFile(file)
    if (!validation.valid) {
      showModalAction("Ảnh bìa chưa giòn!", validation.errors)
      e.target.value = ""
      setImageFile(null)
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImagePreviewUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddAudioTrack = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate audio file
    const validation = await validateAudioFile(file)
    if (!validation.valid) {
      showModalAction("File nhạc chưa chuẩn bạn êi!", validation.errors)
      e.target.value = ""
      return
    }

    // Check release type limits
    if (releaseType === "single" && audioTracks.length >= 2) {
      showModalAction("Thông báo", ["Đã giữ lại 2 track đầu tiên cho định dạng Single."], "success")
      e.target.value = ""
      return
    }

    const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTrack = {
      file,
      id: trackId,
      info: {
        fileName: file.name,
        songTitle: audioTracks.length === 0 ? songTitle : "",
        artistName: audioTracks.length === 0 ? artistName : "",
        artistFullName: audioTracks.length === 0 ? fullName : "",
        additionalArtists: [],
      },
    }

    setAudioTracks([...audioTracks, newTrack])
    e.target.value = ""
  }

  const handleRemoveTrack = (trackId: string) => {
    if (playingTrack === trackId) {
      stopAudio()
    }
    setAudioTracks(audioTracks.filter((track) => track.id !== trackId))
  }

  const updateTrackInfo = (trackId: string, field: keyof TrackInfo, value: any) => {
    setAudioTracks(
      audioTracks.map((track) =>
        track.id === trackId ? { ...track, info: { ...track.info, [field]: value } } : track,
      ),
    )
  }

  const updateTrackCollaborator = (
    trackId: string,
    collaboratorIndex: number,
    field: keyof AdditionalArtist,
    value: any,
  ) => {
    setAudioTracks(
      audioTracks.map((track) => {
        if (track.id === trackId) {
          const updatedCollaborators = [...track.info.additionalArtists]
          updatedCollaborators[collaboratorIndex] = {
            ...updatedCollaborators[collaboratorIndex],
            [field]: value,
          }
          return {
            ...track,
            info: {
              ...track.info,
              additionalArtists: updatedCollaborators,
            },
          }
        }
        return track
      }),
    )
  }

  const removeTrackCollaborator = (trackId: string, collaboratorIndex: number) => {
    setAudioTracks(
      audioTracks.map((track) => {
        if (track.id === trackId) {
          const updatedCollaborators = [...track.info.additionalArtists]
          updatedCollaborators.splice(collaboratorIndex, 1)
          return {
            ...track,
            info: {
              ...track.info,
              additionalArtists: updatedCollaborators,
            },
          }
        }
        return track
      }),
    )
  }

  const addTrackCollaborator = (trackId: string) => {
    setAudioTracks(
      audioTracks.map((track) => {
        if (track.id === trackId) {
          return {
            ...track,
            info: { // Ensure the role is a valid AdditionalArtistRole
              ...track.info,
              additionalArtists: [...track.info.additionalArtists, { name: "", fullName: "", role: "featuring", percentage: 0 }],
            },
          }
        }
        return track
      }),
    )
  }

  const playAudio = (file: File) => {
    if (audioRef.current) {
      const url = URL.createObjectURL(file)
      audioRef.current.src = url
      audioRef.current.play()
      return () => URL.revokeObjectURL(url)
    }
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlayingTrack(null)
    }
  }

  const handlePlayTrack = (trackId: string, trackFile: File) => {
    if (playingTrack === trackId) {
      stopAudio()
    } else {
      if (playingTrack) {
        stopAudio()
      }
      setPlayingTrack(trackId)
      const cleanup = playAudio(trackFile)

      // Play for max 30 seconds
      setTimeout(() => {
        if (playingTrack === trackId) {
          stopAudio()
          if (cleanup) cleanup()
        }
      }, 30000)
    }
  }

  const handleReleaseTypeChange = (value: string) => {
    setReleaseType(value as "" | ReleaseType) // Tôi là An Kun

    // If changing to single and more than 2 tracks, keep only first 2
    if (value === "single" && audioTracks.length > 2) {
      setAudioTracks(audioTracks.slice(0, 2))
      showModalAction("Thông Báo", ["Đã giữ lại 2 track đầu tiên cho định dạng Single."], "success")
    }

    // Set default album name based on release type
    if (value === "single" && songTitle) {
      setAlbumName(`${songTitle} - Single`)
    } else if (songTitle) {
      setAlbumName(songTitle)
    }
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!fullName) errors.push("Vui lòng nhập họ tên đầy đủ.")
    if (!artistName) errors.push("Vui lòng nhập tên nghệ sĩ.")
    if (!artistRole) errors.push("Vui lòng chọn vai trò chính.")
    if (!songTitle) errors.push("Vui lòng nhập tên bài hát.")
    if (!mainCategory) errors.push("Vui lòng chọn thể loại chính.")
    if (!releaseType) errors.push("Vui lòng chọn định dạng phát hành.")
    if (!albumName) errors.push("Vui lòng nhập tên album.")

    if (!imageFile) {
      errors.push("Chưa chọn Ảnh Bìa.")
    }

    if (audioTracks.length === 0) errors.push("Chưa có track nào.")

    // Validate track count based on release type
    if (releaseType === "single" && audioTracks.length > 2) {
      errors.push("Single chỉ cho phép tối đa 2 track.")
    } else if (releaseType === "ep" && audioTracks.length < 2) {
      errors.push("EP cần ít nhất 2 track.")
    } else if (releaseType === "lp" && audioTracks.length < 6) {
      errors.push("LP cần ít nhất 6 track.")
    } else if (releaseType === "album" && audioTracks.length < 10) {
      errors.push("Album cần ít nhất 10 track.")
    }

    if (!isCopyrightOwner) errors.push("Vui lòng chọn thông tin bản quyền.")
    if (!hasBeenReleased) errors.push("Vui lòng chọn thông tin phát hành.")
    if (!hasLyrics) errors.push("Vui lòng chọn thông tin lời bài hát.")
    if (hasLyrics === "yes" && !lyrics) errors.push("Vui lòng nhập lời bài hát.")
    if (!userEmail) errors.push("Vui lòng nhập email liên hệ.")
    if (!releaseDate) errors.push("Vui lòng chọn ngày phát hành.")

    // Validate track infos
    audioTracks.forEach((track, index) => {
      if (!track.info.songTitle) errors.push(`Vui lòng nhập tên bài hát cho track ${index + 1}.`)
      if (!track.info.artistName) errors.push(`Vui lòng nhập tên nghệ sĩ cho track ${index + 1}.`)
      if (!track.info.artistFullName) errors.push(`Vui lòng nhập tên thật nghệ sĩ cho track ${index + 1}.`)
    })

    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm()
    if (errors.length > 0) {
      showModalAction("Ối Dời! Thiếu Vài Thứ Nè:", errors)
      return
    }

    // Generate ISRC
    const { isrc, newCounter } = generateISRC(currentUser, lastISRCCounter)
    setLastISRCCounter(newCounter)
    localStorage.setItem("lastISRCCounter_v3", newCounter.toString())

    // Create submission object
    const submissionData: Submission = {
      id: `MH${Date.now()}`,
      isrc,
      uploaderUsername: currentUser.username,
      artistName,
      songTitle,
      albumName,
      userEmail,
      imageFile: imageFile ? imageFile.name : "Uploaded Image",
      imageUrl: imagePreviewUrl,
      audioFilesCount: audioTracks.length,
      submissionDate: new Date().toISOString(),
      status: "Đã nhận, đang chờ duyệt", // This status is a string, not a specific type from SubmissionStatus
      mainCategory: mainCategory as MainCategory,
      subCategory: subCategory || undefined,
      releaseType: releaseType as ReleaseType,
      isCopyrightOwner: isCopyrightOwner as YesNo,
      hasBeenReleased: hasBeenReleased as YesNo,
      platforms: hasBeenReleased === "yes" ? platforms : [],
      hasLyrics: hasLyrics as YesNo,
      lyrics: hasLyrics === "yes" ? lyrics : undefined,
      notes: notes || undefined,
      fullName: fullName,
      artistRole: artistRole as ArtistRole,
      trackInfos: audioTracks.map((track) => track.info),
      releaseDate: releaseDate,
      additionalArtists: [], // Field is required by Submission type
    }

    // Add submission
    onSubmissionAddedAction(submissionData)

    // Reset form
    resetForm()
  }

  const resetForm = () => {
    setFullName(currentUser.fullName ?? "")
    setArtistName(currentUser.role === "Artist" ? currentUser.username : "")
    setArtistRole("")
    setSongTitle("")
    setMainCategory("")
    setSubCategory("")
    setReleaseType("")
    setAlbumName("")
    setImageFile(null)
    setImagePreviewUrl("/dianhac.jpg")
    setAudioTracks([])
    setIsCopyrightOwner("")
    setHasBeenReleased("")
    setPlatforms([])
    setHasLyrics("")
    setLyrics("")
    setUserEmail(currentUser.email || "")
    setNotes("")
    setReleaseDate(getMinimumReleaseDate())
    // Reset file inputs
    const imageInput = document.getElementById("imageFile") as HTMLInputElement
    if (imageInput) imageInput.value = ""
  }

  const PreviewCard = () => (
    <Card className="bg-gray-800 bg-opacity-60 backdrop-blur-md border border-gray-700">
      <CardContent className="p-6 md:p-8">
        <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
          <Eye className="mr-3 text-sky-400" />
          Xem trước bản phát hành
        </h3>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-400">Tên bài hát:</span>
            <p className="font-bold text-gray-200">{songTitle ?? "-"}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">Album:</span>
            <p className="font-medium text-gray-200">
              {albumName ?? (releaseType === "single" ? `${songTitle ?? "-"} - Single` : "-")}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">Nghệ sĩ:</span>
            <p className="text-gray-100 font-semibold">{artistName ?? "-"}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">Định dạng:</span>
            <p className="text-gray-100 font-semibold">
              {releaseType ?? "-"} ({audioTracks.length} track)
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-400">Ảnh bìa:</span>
            <img
              src={imagePreviewUrl ?? "/placeholder.svg"}
              alt="Xem trước ảnh bìa"
              className="mt-2 rounded-lg w-full max-w-xs mx-auto aspect-square object-cover border-2 border-gray-700"
            />
          </div>
          {audioTracks.length > 0 && (
            <div className="mt-4">
              <span className="block text-sm font-medium text-gray-400 mb-2">Danh sách track:</span>
              {audioTracks.map((track, index) => (
                <div key={track.id} className="flex items-center justify-between p-2 bg-gray-700 rounded mb-2">
                  <div>
                    <p className="text-xs text-gray-300 font-medium">
                      {index + 1}. {track.info.songTitle ?? track.info.fileName}
                    </p>
                    <p className="text-xs text-gray-400">{track.info.artistName}</p>
                    {track.info.additionalArtists && track.info.additionalArtists.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Cùng với: {track.info.additionalArtists.map((a) => `${a.name} (${a.role})`).join(", ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePlayTrack(track.id, track.file)}
                    className="p-1"
                  >
                    {playingTrack === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm pt-4 border-t border-gray-700 text-gray-400">
            {releaseDate && `Ngày phát hành: ${new Date(releaseDate).toLocaleDateString("vi-VN")}`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4">
      <div className="flex-grow lg:w-2/3">
        <Card className="bg-gray-800 bg-opacity-80 backdrop-blur-md border border-gray-700">
          <CardContent className="p-6 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-3">
                <Rocket className="inline-block mr-2" />
                Gửi nhạc chờ sóng  - Nhanh té ghế chỉ 2 ngày
              </h2>
              <p className="text-gray-400">Điền form zui zẻ này để nhạc bạn lên sóng nha.</p>
            </div>

            <Tabs value={formActiveTab} onValueChange={setFormActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline text-black-200">Thông tin</span>
                </TabsTrigger>
                <TabsTrigger value="tracks" className="flex items-center gap-2">
                  <Disc3 className="h-4 w-4" />
                  <span className="hidden sm:inline text-black-200">Tracks</span>
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Copyright className="h-4 w-4" />
                  <span className="hidden sm:inline text-black-200">Bản quyền</span>
                </TabsTrigger>
                <TabsTrigger value="release" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline text-black-200">Phát hành</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <div className="space-y-8">
                  {/* Section 1: Artist Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <UserIcon className="mr-3" />
                      1. Thông tin nghệ sĩ chính
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-gray-300">
                          Họ tên đầy đủ (Người gửi)<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Mạnh An"
                          className="rounded-xl mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="artistName" className="text-gray-300">
                          Tên nghệ sĩ chính (Stage Name)<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="artistName"
                          value={artistName}
                          onChange={(e) => setArtistName(e.target.value)}
                          placeholder="Ví dụ: Z-Cool"
                          className="rounded-xl mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="artistRole" className="text-gray-300">
                          Vai trò chính<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Select value={artistRole} onValueChange={(value) => setArtistRole(value as ArtistRole)}>
                          <SelectTrigger className="rounded-xl mt-1">
                            <SelectValue placeholder="Chọn vai trò..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="singer">Ca sĩ</SelectItem>
                            <SelectItem value="composer">Nhạc sĩ</SelectItem>
                            <SelectItem value="singersongwriter">Singer-Songwriter</SelectItem>
                            <SelectItem value="rapper">Rapper</SelectItem>
                            <SelectItem value="producer">Producer</SelectItem>
                            <SelectItem value="songwriter">Người viết lời</SelectItem>
                            <SelectItem value="instrumentalist">Nhạc công</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Song Info */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <Disc3 className="mr-3" />
                      2. Thông tin bài hát & Phát hành
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="songTitle" className="text-gray-300">
                          Tên bài hát<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="songTitle"
                          value={songTitle}
                          onChange={(e) => setSongTitle(e.target.value)}
                          placeholder="Ví dụ: Giai điệu Gen Z"
                          className="rounded-xl mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="albumName" className="text-gray-300">
                          Tên Album/EP<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="albumName"
                          value={albumName}
                          onChange={(e) => setAlbumName(e.target.value)}
                          placeholder={
                            releaseType === "single" ? "Tự động: [Tên bài hát] - Single" : "Ví dụ: Giai điệu Gen Z - Single"
                          }
                          className="rounded-xl mt-1"
                          disabled={releaseType === "single"}
                        />
                        {releaseType === "single" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Single sẽ tự động có tên: "{songTitle || "[Tên bài hát]"} - Single"
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="mainCategory" className="text-gray-300">
                            Thể Loại Chính<span className="text-red-500 font-bold ml-0.5">*</span>
                          </Label>
                          <Select value={mainCategory} onValueChange={setMainCategory}>
                            <SelectTrigger className="rounded-xl mt-1">
                              <SelectValue placeholder="Chọn thể loại..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pop">Pop</SelectItem>
                              <SelectItem value="singersongwriter">Singer-Songwriter</SelectItem>
                              <SelectItem value="hiphoprap">Hip Hop / Rap</SelectItem>
                              <SelectItem value="edm">EDM</SelectItem>
                              <SelectItem value="rnb">R&B / Soul</SelectItem>
                              <SelectItem value="ballad">Ballad</SelectItem>
                              <SelectItem value="acoustic">Acoustic</SelectItem>
                              <SelectItem value="indie">Indie</SelectItem>
                              <SelectItem value="other_main">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="subCategory" className="text-gray-300">
                            Thể loại phụ:
                          </Label>
                          <Select value={subCategory} onValueChange={setSubCategory}>
                            <SelectTrigger className="rounded-xl mt-1">
                              <SelectValue placeholder="Chọn thể loại..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="official">Official</SelectItem>
                              <SelectItem value="cover">Cover</SelectItem>
                              <SelectItem value="vpop">V-Pop</SelectItem>
                              <SelectItem value="lofi">Lofi</SelectItem>
                              <SelectItem value="chill">Chill</SelectItem>
                              <SelectItem value="trap">Trap</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="alternative">Alternative</SelectItem>
                              <SelectItem value="folk">Folk</SelectItem>
                              <SelectItem value="other_sub">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="releaseType" className="text-gray-300">
                          Định dạng Phát hành<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Select value={releaseType} onValueChange={handleReleaseTypeChange}>
                          <SelectTrigger className="rounded-xl mt-1">
                            <SelectValue placeholder="Chọn định dạng..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single (1-2 tracks)</SelectItem>
                            <SelectItem value="ep">EP (2-5 tracks)</SelectItem>
                            <SelectItem value="lp">LP (6-9 tracks)</SelectItem>
                            <SelectItem value="album">Album (10+ tracks)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Media Upload */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <UploadIcon className="mr-3" />
                      3. Tải lên ảnh bìa
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="imageFile" className="text-gray-300">
                          Ảnh bìa (Vuông)<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="imageFile"
                          type="file"
                          accept="image/jpeg"
                          onChange={handleImageChange}
                          className="mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-400">Yêu cầu: JPG, 4000x4000px. Tối đa 5MB.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tracks">
                <div className="space-y-8">
                  {/* Audio Tracks */}
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <Disc3 className="mr-3" />
                      Tracks
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="audioFiles" className="text-gray-300">
                          Thêm Track Âm Thanh<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="audioFiles"
                          type="file"
                          accept="audio/wav,audio/wave"
                          onChange={handleAddAudioTrack}
                          className="mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Yêu cầu: WAV, tối thiểu 24bit, 44.1kHz. Thêm từng file một.
                        </p>
                      </div>

                      {/* Audio Tracks List */}
                      {audioTracks.length > 0 && (
                        <div className="space-y-4 mt-6">
                          <h4 className="text-lg font-semibold text-purple-300">
                            Danh sách ({audioTracks.length})
                          </h4>
                          {audioTracks.map((track, index) => (
                            <Card key={track.id} className="bg-gray-700 border-gray-600">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <GripVertical className="drag-handle h-5 w-5 text-gray-400" />
                                    <h5 className="font-semibold text-yellow-400">
                                      Track {index + 1}: {track.info.fileName}
                                    </h5>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handlePlayTrack(track.id, track.file)}
                                    >
                                      {playingTrack === track.id ? (
                                        <Pause className="h-4 w-4" />
                                      ) : (
                                        <Play className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRemoveTrack(track.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Track Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                  <div>
                                    <Label className="text-gray-300">
                                      Tên bài hát<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      value={track.info.songTitle}
                                      onChange={(e) => updateTrackInfo(track.id, "songTitle", e.target.value)}
                                      placeholder="Tên bài hát"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">
                                      Tên nghệ sĩ<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      value={track.info.artistName}
                                      onChange={(e) => updateTrackInfo(track.id, "artistName", e.target.value)}
                                      placeholder="Stage name"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-gray-300">
                                      Tên thật nghệ sĩ<span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                      value={track.info.artistFullName}
                                      onChange={(e) => updateTrackInfo(track.id, "artistFullName", e.target.value)}
                                      placeholder="Họ tên thật"
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                {/* Track Collaborators */}
                                <div className="border-t border-gray-600 pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="text-sm font-semibold text-blue-400">
                                      Nghệ sĩ hỗ trợ (Collaborators)
                                    </h6>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addTrackCollaborator(track.id)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Thêm
                                    </Button>
                                  </div>

                                  {track.info.additionalArtists && track.info.additionalArtists.length > 0 && (
                                    <div className="space-y-3">
                                      {track.info.additionalArtists.map((artist, artistIndex) => (
                                        <div
                                          key={artistIndex}
                                          className="bg-gray-800 p-3 rounded border border-gray-600"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-400">
                                              Nghệ sĩ hợp tác #{artistIndex + 1}
                                            </span>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeTrackCollaborator(track.id, artistIndex)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <Label className="text-gray-300 text-xs">
                                                Tên nghệ sĩ (Stage Name)<span className="text-red-500">*</span>
                                              </Label>
                                              <Input
                                                value={artist.name}
                                                onChange={(e) =>
                                                  updateTrackCollaborator(track.id, artistIndex, "name", e.target.value)
                                                }
                                                placeholder="Ví dụ: An Kun"
                                                className="mt-1 text-sm"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-gray-300 text-xs">Tên thật đầy đủ</Label>
                                              <Input
                                                value={artist.fullName || ""}
                                                onChange={(e) =>
                                                  updateTrackCollaborator(
                                                    track.id,
                                                    artistIndex,
                                                    "fullName",
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Họ và tên đầy đủ"
                                                className="mt-1 text-sm"
                                              />
                                            </div>
                                            <div>
                                              <Label className="text-gray-300 text-xs">
                                                Vai trò<span className="text-red-500">*</span>
                                              </Label>
                                              <Select
                                                value={artist.role}
                                                onValueChange={(value) =>
                                                  updateTrackCollaborator(track.id, artistIndex, "role", value)
                                                }
                                              >
                                                <SelectTrigger className="mt-1 text-sm">
                                                  <SelectValue placeholder="Chọn vai trò..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="featuring">Featuring</SelectItem>
                                                  <SelectItem value="vocalist">Vocalist</SelectItem>
                                                  <SelectItem value="rapper">Rapper</SelectItem>
                                                  <SelectItem value="producer">Producer</SelectItem>
                                                  <SelectItem value="composer">Composer</SelectItem>
                                                  <SelectItem value="songwriter">Songwriter</SelectItem>
                                                  <SelectItem value="instrumentalist">Instrumentalist</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label className="text-gray-300 text-xs">Phần trăm bản quyền (%)</Label>
                                              <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={artist.percentage || ""}
                                                onChange={(e) =>
                                                  updateTrackCollaborator(
                                                    track.id,
                                                    artistIndex,
                                                    "percentage",
                                                    Number.parseInt(e.target.value) || 0,
                                                  )
                                                }
                                                placeholder="0"
                                                className="mt-1 text-sm"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details">
                <div className="space-y-8">
                  {/* Section 4: Copyright */}
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <Copyright className="mr-3" />
                      Chi tiết bản quyền & phát hành
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-300 mb-3 block">
                          Bản quyền của bạn?<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <RadioGroup value={isCopyrightOwner} onValueChange={(value: YesNo) => setIsCopyrightOwner(value)}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="copyright-yes" />
                            <Label htmlFor="copyright-yes" className="text-gray-300">
                              Chính chủ! Xác nhận quyền sở hữu. Vậy tức là bạn đã đồng ý với tất cả điều khoản của chúng mình.
                              Và quyền riêng tư bảo mật của chúng mình sẽ được áp dụng tại <br />
                              <a href="https://ankun.dev/privacy-policy" className="text-purple-400 hover:underline">Quyền riêng tư và bảo mật</a> - <a href="https://ankun.dev/terms-and-conditions" className="text-purple-400 hover:underline">Điều khoản dịch vụ</a>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="copyright-no" />
                            <Label htmlFor="copyright-no" className="text-gray-300">
                              Không phải chính chủ! Tuy nhiên nếu bạn có giấy phép hợp lệ. Chúng tôi vẫn hỗ trợ bạn phát hành tại chúng mình. Và bạn cũng đã đồng ý với tất cả điều khoản của chúng mình.
                              Và quyền riêng tư bảo mật của chúng mình sẽ được áp dụng tại <br />
                              <a href="https://ankun.dev/privacy-policy" className="text-purple-400 hover:underline">Quyền riêng tư và bảo mật</a> - <a href="https://ankun.dev/terms-and-conditions" className="text-purple-400 hover:underline">Điều khoản dịch vụ</a>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-300 mb-3 block">
                          Đã từng phát hành?<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <RadioGroup value={hasBeenReleased} onValueChange={setHasBeenReleased}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="released-yes" />
                            <Label htmlFor="released-yes" className="text-gray-300">
                              Nhạc đã từng phát hành (Chúng tôi chỉ hỏi để kiểm tra sản phẩm  của bạn có đang trong trạng thái Content ID trên YouTube hay không. Từ đó việc từ chối hoặc xác minh với bạn sẽ trở nên dễ dàng hơn)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="released-no" />
                            <Label htmlFor="released-no" className="text-gray-300">
                              Chưa, đây là lần đầu (Đứa con tinh thần của bạn sẽ được ra mắt trên hệ thống phân phối của chúng mình chỉ 2 ngày sau khi gửi form này)
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {hasBeenReleased === "yes" && (
                        <div className="pl-6 space-y-2">
                          <Label className="text-xs font-medium text-gray-400">Đã lên sóng ở:</Label>
                          <div className="space-y-2">
                            {["youtube", "spotify", "apple_music", "soundcloud", "other_platform"].map((platform) => (
                              <div key={platform} className="flex items-center space-x-2">
                                <Checkbox
                                  id={platform}
                                  checked={platforms.includes(platform)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setPlatforms([...platforms, platform])
                                    } else {
                                      setPlatforms(platforms.filter((p) => p !== platform))
                                    }
                                  }}
                                />
                                <Label htmlFor={platform} className="text-sm cursor-pointer text-gray-300">
                                  {platform === "youtube" && "YouTube"}
                                  {platform === "spotify" && "Spotify"}
                                  {platform === "apple_music" && "Apple Music"}
                                  {platform === "soundcloud" && "SoundCloud"}
                                  {platform === "other_platform" && "Nền tảng khác"}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 5: Lyrics */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <FileText className="mr-3" />
                      Lời bài hát (Nếu Có)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-300 mb-3 block">
                          Bài này có lời không?<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <RadioGroup value={hasLyrics} onValueChange={setHasLyrics}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="lyrics-yes" />
                            <Label htmlFor="lyrics-yes" className="text-gray-300">
                              Có lời hay lắm nha
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="lyrics-no" />
                            <Label htmlFor="lyrics-no" className="text-gray-300">
                              Có hoặc bổ sung sau chứ lười ^ ^
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {hasLyrics === "yes" && (
                        <div>
                          <Label htmlFor="lyrics" className="text-gray-300">
                            Lời Bài Hát:
                          </Label>
                          <Textarea
                            id="lyrics"
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            rows={8}
                            className="rounded-xl mt-1 h-48"
                            placeholder="Gõ lời vào đây..."
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Mẹo: Đầu dòng tự viết hoa, cuối dòng không cần dấu câu nha.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="release">
                <div className="space-y-8">
                  {/* Section 6: Contact Info */}
                  <div>
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <Mail className="mr-3" />
                      Thông tin liên hệ & Ghi chú
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="userEmail" className="text-gray-300">
                          Email của bạn<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="rounded-xl mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes" className="text-gray-300">
                          Ghi chú thêm:
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="rounded-xl mt-1"
                          placeholder="Anything cool you wanna share?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Release Date */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <Calendar className="mr-3" />
                      Lịch phát hành
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="releaseDate" className="text-gray-300">
                          Ngày phát hành<span className="text-red-500 font-bold ml-0.5">*</span>
                        </Label>
                        <Input
                          id="releaseDate"
                          type="date"
                          value={releaseDate}
                          onChange={(e) => setReleaseDate(e.target.value)}
                          min={getMinimumReleaseDate()}
                          className="rounded-xl mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Ngày sớm nhất có thể chọn là {new Date(getMinimumReleaseDate()).toLocaleDateString("vi-VN")}{" "}
                          (cần 2 ngày để kiểm duyệt)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-semibold text-purple-400 mb-4">🔔 Test Notifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          showModalAction("Test Success", ["This is a success notification with sound!"], "success")
                        }
                        className="text-xs"
                      >
                        ✅ Success
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => showModalAction("Test Error", ["This is an error notification with sound!"], "error")}
                        className="text-xs"
                      >
                        ❌ Error
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => showModalAction("Test Info", ["This is an info notification!"], "success")}
                        className="text-xs"
                      >
                        ℹ️ Info
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => showModalAction("Test Warning", ["This is a warning notification!"], "error")}
                        className="text-xs"
                      >
                        ⚠️ Warning
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Click these buttons to test different notification types with sound effects!
                    </p>
                  </div>

                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                  >
                    <Rocket className="mr-2" />
                    PHÁT HÀNH!
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="lg:w-1/3">
        <div className="preview-sticky">
          <PreviewCard />
        </div>
      </div>

      {/* Mobile Preview Button */}
      <Button className="mobile-preview-button lg:hidden rounded-full" onClick={() => setShowPreview(!showPreview)}>
        {showPreview ? <EyeOff /> : <Eye />}
      </Button>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 bg-gray-900/85 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <PreviewCard />
            <Button className="w-full mt-4 rounded-full" onClick={() => setShowPreview(false)}>
              Đóng xem trước
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
// Tôi là An Kun
