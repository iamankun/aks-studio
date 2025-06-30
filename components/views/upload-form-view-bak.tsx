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
import { ThemeToggle } from "@/components/theme-toggle"
import type { User } from "@/types/user"
import type {
    Submission,
    TrackInfo,
    AdditionalArtist,
    MainCategory,
    SubCategory,
    ReleaseType,
    CopyrightOwnershipStatus,
    ReleaseHistoryStatus,
    LyricsStatus,
    Platform,
    ArtistPrimaryRole,
    AdditionalArtistRole
} from "@/types/submission"
import {
  Rocket,
  UserIcon,
  Disc3,
  UploadIcon,
  Play,
  Pause,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { validateImageFile, validateAudioFile, getMinimumReleaseDate } from "@/lib/utils"

interface AudioTrack {
  file: File
  info: TrackInfo
  id: string
}

interface UploadFormViewProps {
  currentUser: User
  onSubmissionAdded: (submission: Submission) => void
  showModal: (title: string, messages: string[], type?: "error" | "success") => void
}

export default function UploadFormView({ currentUser, onSubmissionAdded, showModal }: Readonly<UploadFormViewProps>) {
  // Form state
  const [fullName, setFullName] = useState(currentUser.fullName ?? "")
  const [artistName, setArtistName] = useState(currentUser.role === "Artist" ? currentUser.username : "")
  const [artistRole, setArtistRole] = useState<ArtistPrimaryRole>("singer")
  const [songTitle, setSongTitle] = useState("")
  const [albumName, setAlbumName] = useState("")
  const [userEmail, setUserEmail] = useState(currentUser.email ?? "")
  const [mainCategory, setMainCategory] = useState<MainCategory>("pop")
  const [subCategory, setSubCategory] = useState<SubCategory>("official")
  const [releaseType, setReleaseType] = useState<ReleaseType>("single")
  const [isCopyrightOwner, setIsCopyrightOwner] = useState<CopyrightOwnershipStatus>("yes")
  const [hasBeenReleased, setHasBeenReleased] = useState<ReleaseHistoryStatus>("no")
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [hasLyrics, setHasLyrics] = useState<LyricsStatus>("no")
  const [lyrics, setLyrics] = useState("")
  const [releaseDate, setReleaseDate] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [lastISRCCounter, setLastISRCCounter] = useState(1000)

  // File states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("")
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])

  // Audio player state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Set minimum release date on component mount
  useEffect(() => {
    setReleaseDate(getMinimumReleaseDate())
  }, [])

  // Additional artist management functions
  const addAdditionalArtist = (trackId: string) => {
    setAudioTracks(prev =>
      prev.map((track) => {
        if (track.id === trackId) {
          return {
            ...track,
            info: {
              ...track.info,
              additionalArtists: [
                ...track.info.additionalArtists,
                {
                  name: "",
                  fullName: "",
                  role: "featuring" as AdditionalArtistRole,
                  percentage: 0
                }
              ]
            }
          }
        }
        return track
      })
    )
  }

  const removeAdditionalArtist = (trackId: string, artistIndex: number) => {
    setAudioTracks(prev =>
      prev.map((track) => {
        if (track.id === trackId) {
          return {
            ...track,
            info: {
              ...track.info,
              additionalArtists: track.info.additionalArtists.filter((_, index) => index !== artistIndex)
            }
          }
        }
        return track
      })
    )
  }

  const updateAdditionalArtist = (trackId: string, artistIndex: number, field: keyof AdditionalArtist, value: string | number) => {
    setAudioTracks(prev =>
      prev.map((track) => {
        if (track.id === trackId) {
          return {
            ...track,
            info: {
              ...track.info,
              additionalArtists: track.info.additionalArtists.map((artist, index) => {
                if (index === artistIndex) {
                  return { ...artist, [field]: value }
                }
                return artist
              })
            }
          }
        }
        return track
      })
    )
  }

  // Audio playback functions
  const toggleAudioPlayback = (trackId: string, audioUrl: string) => {
    if (currentlyPlaying === trackId) {
      // Pause current track
      audioRefs.current[trackId]?.pause()
      setCurrentlyPlaying(null)
    } else {
      // Stop any currently playing track
      if (currentlyPlaying) {
        audioRefs.current[currentlyPlaying]?.pause()
      }

      // Play new track
      if (!audioRefs.current[trackId]) {
        audioRefs.current[trackId] = new Audio(audioUrl)
        audioRefs.current[trackId].addEventListener('ended', () => {
          setCurrentlyPlaying(null)
        })
          }

      audioRefs.current[trackId].play()
      setCurrentlyPlaying(trackId)
    }
  }

  // Platform selection handlers
  const handlePlatformChange = (platform: Platform, checked: boolean) => {
    if (checked) {
      setPlatforms(prev => [...prev, platform])
    } else {
      setPlatforms(prev => prev.filter(p => p !== platform))
      }
  }    // File upload handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

      try {
        const validation = await validateImageFile(file)
        if (!validation.valid) {
          showModal("Lỗi", validation.errors, "error")
          return
        }

        setImageFile(file)
        setImagePreviewUrl(URL.createObjectURL(file))
      } catch (error) {
        showModal("Lỗi", ["Có lỗi xảy ra khi tải ảnh"], "error")
      }
    }

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

      Array.from(files).forEach(async (file) => {
        try {
          const validation = validateAudioFile(file)
          if (!validation.valid) {
            showModal("Lỗi", [`${file.name}: ${validation.errors.join(", ")}`], "error")
            return
          }                const { isrc, newCounter } = generateISRC(currentUser, lastISRCCounter)
                setLastISRCCounter(newCounter)
                
                const newTrack: AudioTrack = {
                    file,
                    id: isrc,
                    info: {
                        fileName: file.name,
                        songTitle: file.name.replace(/\.[^/.]+$/, ""), // Default to filename without extension
                        artistName: artistName,
                        artistFullName: fullName,
                        additionalArtists: []
                    }
                }

                setAudioTracks(prev => [...prev, newTrack])
        } catch (error) {
          showModal("Lỗi", [`Có lỗi xảy ra khi tải file ${file.name}`], "error")
        }
      })
    }

  const removeAudioTrack = (trackId: string) => {
    setAudioTracks(prev => prev.filter(track => track.id !== trackId))
    if (currentlyPlaying === trackId) {
      audioRefs.current[trackId]?.pause()
      setCurrentlyPlaying(null)
    }
    if (audioRefs.current[trackId]) {
      URL.revokeObjectURL(audioRefs.current[trackId].src)
      delete audioRefs.current[trackId]
    }
  }

  // ISRC function - generates proper formatted ISRC code
const generateISRC = (user: User, lastCounter: number) => {
    // Format: VNA2P2500001 where:
    // VN - Country code for Vietnam
    // A2P - Issuer code for An Kun Studio
    // 25 - Year (2025)
    // 00001 - Sequential 5-digit number
    
    const newCounter = lastCounter + 1
    const year = new Date().getFullYear().toString().slice(2) // Get last 2 digits of year
    const isrc = `VNA2P${year}${String(newCounter).padStart(5, "0")}`
    
    return {
        isrc,
        newCounter,
    }
}

  // Form submission handler
  const handleSubmit = async () => {
    // Validation
    if (!songTitle.trim()) {
      showModal("Lỗi", ["Vui lòng nhập tên bài hát"], "error")
      return
    }
    if (!artistName.trim()) {
      showModal("Lỗi", ["Vui lòng nhập tên nghệ sĩ"], "error")
      return
    }
    if (audioTracks.length === 0) {
      showModal("Lỗi", ["Vui lòng upload ít nhất một file nhạc"], "error")
      return
    }

    setIsUploading(true)

    try {
      const { isrc, newCounter } = generateISRC(currentUser, lastISRCCounter)
      setLastISRCCounter(newCounter)

        const newSubmission: Submission = {
          id: Date.now().toString(),
          isrc: audioTracks[0]?.id || "",
          uploaderUsername: currentUser.username,
          artistName,
          songTitle,
          albumName,
          userEmail,
            imageFile: imageFile?.name ?? "",
            imageUrl: imagePreviewUrl,
            audioFilesCount: audioTracks.length,
            status: "pending",
            submissionDate: new Date().toISOString(),
            mainCategory,
            subCategory,
            releaseType,
            isCopyrightOwner,
            hasBeenReleased,
            platforms: hasBeenReleased === "yes" ? platforms : [],
            hasLyrics,
            lyrics: hasLyrics === "yes" ? lyrics : "",
            releaseDate,
            artistRole,
            fullName,
            additionalArtists: [], // Required by Submission type
            trackInfos: audioTracks.map(track => track.info) // Map audio tracks to trackInfos
          }

        onSubmissionAdded(newSubmission)

        // Reset form
        resetForm()

        showModal("Thành công", ["Đã gửi bài hát để chờ duyệt!"], "success")
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi bài hát";
        showModal("Lỗi", [errorMessage], "error")
      } finally {
        setIsUploading(false)
      }
  }

  const resetForm = () => {
    setArtistName(currentUser.role === "Artist" ? currentUser.username : "")
    setSongTitle("")
    setAlbumName("")
    setUserEmail(currentUser.email ?? "")
    setMainCategory("pop")
    setSubCategory("official")
    setReleaseType("single")
    setIsCopyrightOwner("yes")
    setHasBeenReleased("no")
    setPlatforms([])
    setHasLyrics("no")
    setLyrics("")
    setImageFile(null)
    setImagePreviewUrl("")
    setAudioTracks([])
    setReleaseDate(getMinimumReleaseDate())
  }

  return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 p-4">
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">🎵 Upload Nhạc Để Phát Hành Toàn Cầu</h1>
                        <p className="text-gray-600 dark:text-gray-400">Tải lên nhạc của bạn và chia sẻ với thế giới</p>
                    </div>
                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <UploadIcon className="h-4 w-4" />
            Media Files
          </TabsTrigger>
          <TabsTrigger value="metadata" className="flex items-center gap-2">
            <Disc3 className="h-4 w-4" />
            Metadata
          </TabsTrigger>
          <TabsTrigger value="release" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Phát hành
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Thông tin nghệ sĩ</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <Label htmlFor="fullName">Họ và tên đầy đủ *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <Label htmlFor="artistName">Tên nghệ sĩ *</Label>
                  <Input
                    id="artistName"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="Ví dụ: AnKun"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userEmail">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="artistRole">Vai trò chính *</Label>
                  <Select value={artistRole} onValueChange={(value: ArtistPrimaryRole) => setArtistRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singer">Ca sĩ</SelectItem>
                      <SelectItem value="singer-songwriter">Singer-Songwriter</SelectItem>
                      <SelectItem value="rapper">Rapper</SelectItem>
                      <SelectItem value="producer">Producer</SelectItem>
                      <SelectItem value="composer">Composer</SelectItem>
                      <SelectItem value="songwriter">Songwriter</SelectItem>
                      <SelectItem value="instrumental">Instrumental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="songTitle">Tên bài hát *</Label>
                  <Input
                    id="songTitle"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="Tên bài hát của bạn"
                  />
                </div>

                <div>
                  <Label htmlFor="albumName">Tên album (tùy chọn)</Label>
                  <Input
                    id="albumName"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="Tên album (nếu có)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h3 className="text-xl font-semibold mb-4">Tải lên Media Files</h3>

              {/* Image Upload */}
              <div>
                <Label htmlFor="imageUpload">Ảnh bìa bài hát (4000x4000px, tối đa 5MB) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    className="mb-4"
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Chọn ảnh bìa
                  </Button>
                  {imagePreviewUrl && (
                    <div className="mt-4">
                      <img
                        src={imagePreviewUrl}
                        alt="Preview"
                        className="mx-auto max-w-xs rounded-lg"
                        />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreviewUrl("")
                        }}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Xóa ảnh
                      </Button>
                    </div>)}
                </div>
              </div>

              {/* Audio Upload */}
              <div>
                <Label htmlFor="audioUpload">File nhạc (WAV, tối đa 44100Hz, 24bit, 2 kênh mỗi file) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="audioUpload"
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('audioUpload')?.click()}
                    className="mb-4"
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Chọn file nhạc
                  </Button>

                  {audioTracks.length > 0 && (
                    <div className="mt-4 space-y-4">
                      {audioTracks.map((track, index) => (                                                <div key={track.id} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">{track.file.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleAudioPlayback(track.id, URL.createObjectURL(track.file))}
                                                            >
                                                                {currentlyPlaying === track.id ? (
                                                                    <Pause className="h-4 w-4" />
                                                                ) : (
                                                                    <Play className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeAudioTrack(track.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Track title input field */}
                                                    <div className="mb-4">
                                                        <Label htmlFor={`track-title-${track.id}`}>Tên bài hát</Label>
                                                        <Input
                                                            id={`track-title-${track.id}`}
                                                            value={track.info.songTitle}
                                                            onChange={(e) => {
                                                                setAudioTracks(prev =>
                                                                    prev.map(t => {
                                                                        if (t.id === track.id) {
                                                                            return {
                                                                                ...t,
                                                                                info: {
                                                                                    ...t.info,
                                                                                    songTitle: e.target.value
                                                                                }
                                                                            };
                                                                        }
                                                                        return t;
                                                                    })
                                                                );
                                                            }}
                                                            placeholder="Nhập tên bài hát"
                                                            className="mt-1"
                                                        />
                                                    </div>

                                                    {/* Additional Artists for this track */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <Label>Nghệ sĩ phối hợp (tùy chọn)</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addAdditionalArtist(track.id)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Thêm nghệ sĩ
                                </Button>
                              </div>

                              {track.info.additionalArtists.map((artist, artistIndex) => (
                                                    <div key={artistIndex} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 bg-gray-50 rounded">
                                                      <Input
                                                        placeholder="Tên nghệ sĩ"
                                                        value={artist.name}
                                                        onChange={(e) => updateAdditionalArtist(track.id, artistIndex, 'name', e.target.value)}
                                                      />
                                                      <Input
                                                        placeholder="Họ tên đầy đủ"
                                                        value={artist.fullName || ""}
                                                        onChange={(e) => updateAdditionalArtist(track.id, artistIndex, 'fullName', e.target.value)}
                                                      />
                                                      <Select
                                                        value={artist.role}
                                                        onValueChange={(value: AdditionalArtistRole) => updateAdditionalArtist(track.id, artistIndex, 'role', value)}
                                                      >
                                                        <SelectTrigger>
                                                          <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                          <SelectItem value="featuring">Featuring</SelectItem>
                                                          <SelectItem value="vocalist">Vocalist</SelectItem>
                                                          <SelectItem value="rapper">Rapper</SelectItem>
                                                          <SelectItem value="producer">Producer</SelectItem>
                                                          <SelectItem value="composer">Composer</SelectItem>
                                                          <SelectItem value="songwriter">Songwriter</SelectItem>
                                                          <SelectItem value="instrumental">Instrumental</SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                      <div className="flex items-center gap-2">
                                                        <Input
                                                          type="number"
                                                          placeholder="% quyền"
                                                          min="0"
                                                          max="100"
                                                          value={artist.percentage}
                                                          onChange={(e) => updateAdditionalArtist(track.id, artistIndex, 'percentage', parseInt(e.target.value) || 0)}
                                                        />
                                                        <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => removeAdditionalArtist(track.id, artistIndex)}
                                                        >
                                                          <X className="h-4 w-4" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Thông tin metadata</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="mainCategory">Thể loại chính *</Label>
                  <Select value={mainCategory} onValueChange={(value: MainCategory) => setMainCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="singer-songwriter">Singer-Songwriter</SelectItem>
                      <SelectItem value="hiphoprap">Hip Hop/Rap</SelectItem>
                      <SelectItem value="edm">EDM</SelectItem>
                      <SelectItem value="rnb">R&B</SelectItem>
                      <SelectItem value="ballad">Ballad</SelectItem>
                      <SelectItem value="acoustic">Acoustic</SelectItem>
                      <SelectItem value="indie">Indie</SelectItem>
                      <SelectItem value="other_main">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subCategory">Thể loại phụ *</Label>
                  <Select value={subCategory} onValueChange={(value: SubCategory) => setSubCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Official</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="vpop">V-Pop</SelectItem>
                      <SelectItem value="lofi">Lo-fi</SelectItem>
                      <SelectItem value="chill">Chill</SelectItem>
                      <SelectItem value="trap">Trap</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="alternative">Alternative</SelectItem>
                      <SelectItem value="folk">Folk</SelectItem>
                      <SelectItem value="other_sub">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="releaseType">Loại phát hành *</Label>
                  <Select value={releaseType} onValueChange={(value: ReleaseType) => setReleaseType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="ep">EP</SelectItem>
                      <SelectItem value="lp">LP</SelectItem>
                      <SelectItem value="album">Album</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>
              </div>

              <div>
                <Label>Bạn có sở hữu bản quyền của bài hát này không? *</Label>
                <RadioGroup
                  value={isCopyrightOwner}
                  onValueChange={(value: CopyrightOwnershipStatus) => setIsCopyrightOwner(value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="copyright-yes" />
                    <Label htmlFor="copyright-yes">Có</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="copyright-no" />
                    <Label htmlFor="copyright-no">Không</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Bài hát này đã từng được phát hành chưa? *</Label>
                <RadioGroup
                  value={hasBeenReleased}
                  onValueChange={(value: ReleaseHistoryStatus) => setHasBeenReleased(value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="released-yes" />
                    <Label htmlFor="released-yes">Đã phát hành</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="released-no" />
                    <Label htmlFor="released-no">Chưa phát hành</Label>
                  </div>
                </RadioGroup>
              </div>

              {hasBeenReleased === "yes" && (
                <div>
                  <Label>Các nền tảng đã phát hành:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {[
                      { value: "youtube" as Platform, label: "YouTube" },
                      { value: "spotify" as Platform, label: "Spotify" },
                      { value: "apple_music" as Platform, label: "Apple Music" },
                      { value: "soundcloud" as Platform, label: "SoundCloud" },
                      { value: "other_platform" as Platform, label: "Khác" }
                    ].map((platform) => (
                      <div key={platform.value} className="flex items-center space-x-2">
                        <Checkbox
                            id={platform.value}
                            checked={platforms.includes(platform.value)}
                            onCheckedChange={(checked) =>
                              handlePlatformChange(platform.value, checked as boolean)
                            }
                          />
                          <Label htmlFor={platform.value}>{platform.label}</Label>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Bài hát có lời không? *</Label>
                <RadioGroup
                  value={hasLyrics}
                  onValueChange={(value: LyricsStatus) => setHasLyrics(value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="lyrics-yes" />
                    <Label htmlFor="lyrics-yes">Có lời</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="lyrics-no" />
                    <Label htmlFor="lyrics-no">Instrumental</Label>
                  </div>
                </RadioGroup>
              </div>

              {hasLyrics === "yes" && (
                <div>
                  <Label htmlFor="lyrics">Lời bài hát</Label>
                  <Textarea
                    id="lyrics"
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Nhập lời bài hát của bạn..."
                    rows={8}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="release" className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Thông tin phát hành</h3>

              <div>
                <Label htmlFor="releaseDate">Ngày phát hành mong muốn *</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  min={getMinimumReleaseDate()}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ngày phát hành phải ít nhất 7 ngày kể từ hôm nay
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Tóm tắt thông tin</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Nghệ sĩ:</strong> {artistName || "Chưa nhập"}</p>
                  <p><strong>Bài hát:</strong> {songTitle || "Chưa nhập"}</p>
                  <p><strong>Album:</strong> {albumName || "Không có"}</p>
                  <p><strong>Thể loại:</strong> {mainCategory} - {subCategory}</p>
                  <p><strong>Loại phát hành:</strong> {releaseType}</p>
                  <p><strong>Files âm thanh:</strong> {audioTracks.length} file(s)</p>
                  <p><strong>Có ảnh bìa:</strong> {imageFile ? "Có" : "Chưa có"}</p>
                  <p><strong>Ngày phát hành:</strong> {releaseDate || "Chưa chọn"}</p>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isUploading || !songTitle || !artistName || audioTracks.length === 0}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4" />
                    Gửi để chờ duyệt
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
