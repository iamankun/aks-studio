export interface User {
  id: string
  username: string
  password_hash?: string
  role: "Label Manager" | "Artist"
  full_name: string
  email: string
  avatar_url?: string
  bio?: string
  social_links?: {
    facebook?: string
    youtube?: string
    spotify?: string
    appleMusic?: string
    tiktok?: string
    instagram?: string
  }
  isrc_code_prefix?: string
  created_at: string
}

export interface LabelManager {
  id: number
  username: string
  password: string
  fullname: string
  email: string
  avatar: string
  bio: string
  createdat: string
  facebook: string
  youtube: string
  spotify: string
  applemusic: string
  tiktok: string
  instagram: string
}

export interface ArtistAttachment {
  id: number
  artist_id: string
  attachment_type: string
  file_name: string
  file_url: string
  file_size?: number
  mime_type?: string
  uploaded_at: string
  status: "pending" | "approved" | "rejected"
  notes?: string
}
