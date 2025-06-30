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

export type SubmissionStatus = "pending" | "approved" | "rejected" | "processing" | "published" | "draft" | "Đã nhận, đang chờ duyệt"

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
  uploaderUsername: string
  artistName: string
  songTitle: string
  albumName?: string
  userEmail: string
  imageFile: string
  imageUrl: string
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
}
