export type ArtistPrimaryRole =
  | "singer"
  | "rapper"
  | "producer"
  | "composer"
  | "songwriter"
  | "instrumentalist";

export type AdditionalArtistRole =
  | "featuring"
  | "vocalist"
  | "rapper"
  | "producer"
  | "composer"
  | "songwriter"
  | "instrumentalist";

export type ReleaseType = "single" | "ep" | "lp" | "album";

export type MainCategory = "pop" | "rock" | "hiphop" | "edm" | "rnb" | "ballad" | "acoustic" | "indie" | "other_main";
export type SubCategory = "lofi" | "chillhop" | "trap" | "house" | "alternative" | "folk" | "other_sub";

export type CopyrightOwnershipStatus = "yes" | "no";
export type ReleaseHistoryStatus = "yes" | "no";
export type LyricsStatus = "yes" | "no";

export type Platform = "youtube" | "spotify" | "apple_music" | "soundcloud" | "other_platform";

export type SubmissionStatus = "pending" | "approved" | "rejected" | "processing" | "published" | "draft" | "Đã nhận, đang chờ duyệt";

export interface TrackInfo {
  fileName: string
  songTitle: string
  artistName: string
  artistFullName: string
  additionalArtists: AdditionalArtist[];
}

export interface AdditionalArtist {
  name: string
  fullName?: string
  role: AdditionalArtistRole
  percentage: number;
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
  additionalArtists: AdditionalArtist[]; // This seems redundant if trackInfos has additionalArtists. Consider if this is top-level or per-track.
  trackInfos: TrackInfo[]
  releaseDate: string
  titleStyle?: TextStyle
  albumStyle?: TextStyle
}
