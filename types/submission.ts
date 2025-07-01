export type ArtistPrimaryRole =
  | "singer"
  | "singer-songwriter" 
  | "rapper"
  | "producer"
  | "composer"
  | "songwriter"
  | "instrumental"

export type AdditionalArtistRole =
  | "featuring"
  | "vocalist"
  | "rapper"
  | "producer"
  | "composer"
  | "songwriter"
  | "instrumental"

export type ReleaseType = "single" | "ep" | "lp" | "album"

export type MainCategory = "pop" | "singer-songwriter" | "hiphoprap" | "edm" | "rnb" | "ballad" | "acoustic" | "indie" | "other_main"
export type SubCategory = "official" | "cover" | "vpop" | "lofi" | "chill" | "trap" | "house" | "alternative" | "folk" | "other_sub"

export type CopyrightOwnershipStatus = "yes" | "no"
export type ReleaseHistoryStatus = "yes" | "no"
export type LyricsStatus = "yes" | "no"

export type Platform = "youtube" | "spotify" | "apple_music" | "soundcloud" | "other_platform"

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processing"
  | "published"
  | "draft"
  | "Đã nhận, đang chờ duyệt"
  | "Đã duyệt, từ chối phát hành"
  | "Đã duyệt, đang chờ phát hành!"
  | "Đã phát hành, đang chờ ra mắt"
  | "Hoàn thành phát hành!"

export interface TrackInfo {
  fileName: string
  songTitle: string
  artistName: string
  artistFullName: string
  additionalArtists: AdditionalArtist[]
  title: string
  isrc: string
}

export interface AdditionalArtist {
  name: string
  fullName?: string
  role: AdditionalArtistRole
  percentage: number
}

export interface TextStyle {
  gradient: string
  animation: string
  font: string
}

export interface Submission {
  id: string
  isrc: string
  upc?: string // Thêm trường UPC
  uploaderUsername: string
  artistName: string
  songTitle: string
  albumName?: string
  userEmail: string
  imageFile: string
  imageUrl: string
  audioUrl?: string // link file nhạc (single)
  audioUrls?: string[] // danh sách link file nhạc (album, ep, v.v.)
  videoUrl?: string // link file video (nếu có)
  videoFile?: string
  audioFilesCount: number
  submissionDate: string
  status: SubmissionStatus
  mainCategory: MainCategory
  subCategory?: SubCategory
  releaseType: ReleaseType
  isCopyrightOwner: CopyrightOwnershipStatus
  hasBeenReleased: ReleaseHistoryStatus
  platforms: Platform[]
  hasLyrics: LyricsStatus
  lyrics?: string
  notes?: string
  fullName: string
  artistRole: ArtistPrimaryRole
  additionalArtists: AdditionalArtist[]
  trackInfos: TrackInfo[]
  releaseDate: string
  titleStyle?: TextStyle
  albumStyle?: TextStyle
  userId: string
  distributionLink?: string // Link phân phối (FFM.to, etc.)
  distributionPlatforms?: {
    platform: string;
    url: string;
    logo: string;
  }[] // Các nền tảng phân phối cụ thể với URL
}

// Status color helper functions
export function getStatusColor(status: SubmissionStatus): string {
  switch (status) {
    case "Đã nhận, đang chờ duyệt":
      return "bg-yellow-600 text-yellow-100";
    case "Đã duyệt, từ chối phát hành":
      return "bg-red-600 text-red-100";
    case "Đã duyệt, đang chờ phát hành!":
      return "bg-blue-600 text-blue-100";
    case "Đã phát hành, đang chờ ra mắt":
      return "bg-purple-600 text-purple-100";
    case "Hoàn thành phát hành!":
      return "bg-green-600 text-green-100";
    case "pending":
      return "bg-yellow-600 text-yellow-100";
    case "approved":
      return "bg-blue-600 text-blue-100";
    case "rejected":
      return "bg-red-600 text-red-100";
    case "processing":
      return "bg-purple-600 text-purple-100";
    case "published":
      return "bg-green-600 text-green-100";
    case "draft":
      return "bg-gray-600 text-gray-100";
    default:
      return "bg-gray-600 text-gray-100";
  }
}

// Get a human-readable status text
export function getStatusText(status: SubmissionStatus): string {
  switch (status) {
    case "pending":
      return "Đã nhận, đang chờ duyệt";
    case "approved":
      return "Đã duyệt, đang chờ phát hành!";
    case "rejected":
      return "Đã duyệt, từ chối phát hành";
    case "processing":
      return "Đã phát hành, đang chờ ra mắt";
    case "published":
      return "Hoàn thành phát hành!";
    case "draft":
      return "Bản nháp";
    default:
      return status;
  }
}
