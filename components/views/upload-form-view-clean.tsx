"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Music, Eye, EyeOff, Pause, Play, Rocket, Disc3, User as UserIcon, Copyright, Calendar, FileText, Upload as UploadIcon, Plus, Trash2, X, GripVertical } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ThemeToggle } from "@/components/theme-toggle"
import type { User } from "@/types/user"
import type { Submission } from "@/types/submission"
import type { MainCategory, SubCategory, ReleaseType, Platform, ArtistPrimaryRole, TrackInfo, AdditionalArtist } from "@/types/submission"

interface UploadFormViewProps {
  currentUser: User
  onSubmissionAdded: (submission: Submission) => void
  showModal: (title: string, message: string, type?: "success" | "error") => void
}

type AudioTrack = {
  file: File
  id: string
  info: TrackInfo
}

type YesNo = "yes" | "no"

function generateISRC(user: User, lastCounter: number) {
  // Get current year's last two digits (e.g., 2025 -> 25)
  const currentYear = new Date().getFullYear().toString().slice(2)
  const newCounter = lastCounter + 1
  return {
    isrc: `VNA2P${currentYear}${String(newCounter).padStart(5, "18")}`,
    newCounter,
  }
}

function getMinimumReleaseDate() {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  return d.toISOString().split("T")[0]
}

// Dummy validation functions
async function validateImageFile(file: File) {
  // Replace with real validation
  return { valid: true, errors: [] as string[] }
}

async function validateAudioFile(file: File) {
  // Replace with real validation
  return { valid: true, errors: [] as string[] }
}

export default function UploadFormView({
  currentUser,
  onSubmissionAdded,
  showModal,
}: UploadFormViewProps) {
  // State declarations
  const [isUploading, setIsUploading] = useState(false)
  const [formActiveTab, setFormActiveTab] = useState("info")
  const [fullName, setFullName] = useState(currentUser.fullName ?? "")
  const [artistName, setArtistName] = useState(currentUser.role === "Artist" ? currentUser.username : "")
  const [artistRole, setArtistRole] = useState<"" | ArtistPrimaryRole>("")
  const [songTitle, setSongTitle] = useState("")
  const [mainCategory, setMainCategory] = useState<"" | MainCategory>("")
  const [subCategory, setSubCategory] = useState<"" | SubCategory>("")
  const [releaseType, setReleaseType] = useState<"" | ReleaseType>("")
  const [albumName, setAlbumName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState("/dianhac.jpg")
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [isCopyrightOwner, setIsCopyrightOwner] = useState<"" | YesNo>("")
  const [hasBeenReleased, setHasBeenReleased] = useState<"" | YesNo>("")
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [hasLyrics, setHasLyrics] = useState<"" | YesNo>("")
  const [lyrics, setLyrics] = useState("")
  const [userEmail, setUserEmail] = useState(currentUser.email || "")
  const [notes, setNotes] = useState("")
  const [releaseDate, setReleaseDate] = useState(getMinimumReleaseDate())
  const [lastISRCCounter, setLastISRCCounter] = useState(0)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [additionalArtists, setAdditionalArtists] = useState<AdditionalArtist[]>([])

  // useEffect để xử lý localStorage ở phía client
  React.useEffect(() => {
    // Kiểm tra xem đang ở môi trường client
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lastISRCCounter_v3")
      if (stored) {
        setLastISRCCounter(parseInt(stored, 10))
      }
    }
  }, [])

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  // Handlers
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = await validateImageFile(file)
    if (!validation.valid) {
      showModal("Lỗi", validation.errors.join(", "), "error")
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAudioChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    for (const file of files) {
      const validation = await validateAudioFile(file)
      if (!validation.valid) {
        showModal("Lỗi", `${file.name}: ${validation.errors.join(", ")}`, "error")
        continue
      }

      const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const { isrc, newCounter } = generateISRC(currentUser, lastISRCCounter)
      setLastISRCCounter(newCounter)

      // An toàn khi sử dụng localStorage - chỉ lưu ở phía client
      if (typeof window !== "undefined") {
        localStorage.setItem("lastISRCCounter_v3", newCounter.toString())
      }

      const fileName = file.name
      const trackTitle = file.name.replace(/\.[^/.]+$/, "")

      const newTrack: AudioTrack = {
        file,
        id: trackId,
        info: {
          fileName,
          songTitle: trackTitle,
          artistName: artistName,
          artistFullName: fullName,
          additionalArtists: [],
          title: trackTitle,
          isrc,
        },
      }

      setAudioTracks(prev => [...prev, newTrack])
    }
  }

  const handleSubmit = async () => {
    // Basic validation
    if (!songTitle.trim()) {
      showModal("Lỗi", "Vui lòng nhập tên bài hát", "error")
      return
    }
    if (!artistName.trim()) {
      showModal("Lỗi", "Vui lòng nhập tên nghệ sĩ", "error")
      return
    }
    if (audioTracks.length === 0) {
      showModal("Lỗi", "Vui lòng upload ít nhất một file nhạc", "error")
      return
    }

    setIsUploading(true)
    try {
      // Create submission object
      const submission: Submission = {
        id: `sub_${Date.now()}`,
        userId: currentUser.id,
        isrc: audioTracks[0]?.info.isrc || "",
        uploaderUsername: currentUser.username || "",
        artistName,
        songTitle,
        userEmail: userEmail,
        imageFile: imageFile?.name || "",
        imageUrl: imagePreviewUrl,
        audioFilesCount: audioTracks.length,
        submissionDate: new Date().toISOString(),
        status: "pending",
        mainCategory: mainCategory as MainCategory,
        subCategory: subCategory as SubCategory,
        releaseType: releaseType as ReleaseType,
        isCopyrightOwner: isCopyrightOwner as "yes" | "no" || "no",
        hasBeenReleased: hasBeenReleased as "yes" | "no" || "no",
        platforms: platforms,
        hasLyrics: hasLyrics as "yes" | "no" || "no",
        lyrics: lyrics,
        notes,
        fullName: fullName,
        artistRole: artistRole as ArtistPrimaryRole || "singer",
        additionalArtists: additionalArtists,
        trackInfos: audioTracks.map(track => track.info),
        releaseDate,
        albumName,
      }

      onSubmissionAdded(submission)
      showModal("Thành công", "Submission đã được tạo thành công!", "success")

      // Reset form
      setSongTitle("")
      setArtistName(currentUser.role === "Artist" ? currentUser.username : "")
      setMainCategory("")
      setSubCategory("")
      setReleaseType("")
      setAlbumName("")
      setImageFile(null)
      setImagePreviewUrl("/dianhac.jpg")
      setAudioTracks([])
      setFormActiveTab("info")
    } catch (error) {
      showModal("Lỗi", "Có lỗi xảy ra khi tạo submission", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const togglePlayback = (trackId: string) => {
    setPlayingTrack(prev => prev === trackId ? null : trackId)
  }

  const removeTrack = (trackId: string) => {
    setAudioTracks(prev => prev.filter(track => track.id !== trackId))
  }

  const PreviewCard = () => (
    <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-white/20 overflow-hidden">
            <img src={imagePreviewUrl} alt="Album Art" className="w-full h-full object-cover" />
          </div>
          <div>
            <CardTitle className="text-lg">{songTitle || "Tên bài hát"}</CardTitle>
            <p className="text-white/80">{artistName || "Tên nghệ sĩ"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Thể loại:</span>
            <span>{mainCategory || "Chưa chọn"}</span>
          </div>
          <div className="flex justify-between">
            <span>Loại phát hành:</span>
            <span>{releaseType || "Chưa chọn"}</span>
          </div>
          <div className="flex justify-between">
            <span>Số track:</span>
            <span>{audioTracks.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Upload Submission
                </CardTitle>
                <ThemeToggle />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={formActiveTab} onValueChange={setFormActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="tracks">Tracks</TabsTrigger>
                  <TabsTrigger value="review">Xem lại</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="songTitle">Tên bài hát *</Label>
                      <Input
                        id="songTitle"
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Nhập tên bài hát"
                      />
                    </div>
                    <div>
                      <Label htmlFor="artistName">Tên nghệ sĩ *</Label>
                      <Input
                        id="artistName"
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                        placeholder="Nhập tên nghệ sĩ"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mainCategory">Thể loại chính *</Label>
                      <Select value={mainCategory} onValueChange={(value) => setMainCategory(value as MainCategory)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn thể loại" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pop">Pop</SelectItem>
                          <SelectItem value="rock">Rock</SelectItem>
                          <SelectItem value="hip-hop">Hip Hop</SelectItem>
                          <SelectItem value="electronic">Electronic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="releaseType">Loại phát hành *</Label>
                      <Select value={releaseType} onValueChange={(value) => setReleaseType(value as ReleaseType)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại phát hành" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="album">Album</SelectItem>
                          <SelectItem value="ep">EP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <div>
                    <Label>Ảnh bìa</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                        <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <UploadIcon className="h-4 w-4 mr-2" />
                          Chọn ảnh
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          JPG, PNG tối đa 10MB
                        </p>
                      </div>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      title="Upload cover image"
                    />
                  </div>

                  <div>
                    <Label>Audio Files</Label>
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => audioInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed"
                      >
                        <div className="text-center">
                          <Music className="h-8 w-8 mx-auto mb-2" />
                          <p>Click để chọn audio files</p>
                          <p className="text-sm text-gray-500">MP3, WAV, FLAC</p>
                        </div>
                      </Button>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        multiple
                        onChange={handleAudioChange}
                        className="hidden"
                        title="Upload audio files"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tracks" className="space-y-4">
                  {audioTracks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có track nào. Hãy upload audio ở tab Files.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audioTracks.map((track) => (
                        <Card key={track.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePlayback(track.id)}
                              >
                                {playingTrack === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                              </Button>
                              <div className="flex-grow">
                                <div className="mb-2">
                                  <Label htmlFor={`track-title-${track.id}`}>Track Title</Label>
                                  <Input
                                    id={`track-title-${track.id}`}
                                    value={track.info.title}
                                    onChange={(e) => {
                                      const updatedTracks = audioTracks.map(t =>
                                        t.id === track.id
                                          ? { ...t, info: { ...t.info, title: e.target.value } }
                                          : t
                                      )
                                      setAudioTracks(updatedTracks)
                                    }}
                                    placeholder="Enter track title"
                                  />
                                </div>
                                <p className="text-sm text-gray-500">ISRC: {track.info.isrc}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeTrack(track.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="review" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Xem lại thông tin</h3>
                    <div className="grid gap-4">
                      <div>
                        <Label>Tên bài hát</Label>
                        <p className="font-medium">{songTitle || "Chưa nhập"}</p>
                      </div>
                      <div>
                        <Label>Nghệ sĩ</Label>
                        <p className="font-medium">{artistName || "Chưa nhập"}</p>
                      </div>
                      <div>
                        <Label>Thể loại</Label>
                        <p className="font-medium">{mainCategory || "Chưa chọn"}</p>
                      </div>
                      <div>
                        <Label>Số lượng track</Label>
                        <p className="font-medium">{audioTracks.length}</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isUploading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isUploading ? "Đang xử lý..." : "Tạo Submission"}
                      <Rocket className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <PreviewCard />
          </div>
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
  )
}
