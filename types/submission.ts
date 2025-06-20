export interface TrackInfo {
  fileName: string
  songTitle: string
  artistName: string
  artistFullName: string
  additionalArtists: AdditionalArtist[]
}

export interface AdditionalArtist {
  name: string
  fullName?: string
  role: string
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
  status: string
  mainCategory: string
  subCategory?: string
  releaseType: string
  isCopyrightOwner: string
  hasBeenReleased: string
  platforms: string[]
  hasLyrics: string
  lyrics?: string
  notes?: string
  fullName: string
  artistRole: string
  additionalArtists: AdditionalArtist[]
  trackInfos: TrackInfo[]
  releaseDate: string
  titleStyle?: TextStyle
  albumStyle?: TextStyle
}
