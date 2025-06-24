export interface User {
  id: string
  username: string
  password: string
  email: string
  role: "Label Manager" | "Artist"
  fullName: string
  createdAt: string
  avatar?: string
  bio?: string
  facebook?: string
  youtube?: string
  spotify?: string
  applemusic?: string
  tiktok?: string
  instagram?: string
}

export interface LabelManager {
  id: string
  username: string
  password: string
  fullname: string
  email: string
  avatar?: string
  bio?: string
  createdat: string
  facebook?: string
  youtube?: string
  spotify?: string
  applemusic?: string
  tiktok?: string
  instagram?: string
}

export interface Artist {
  id: string
  username: string
  password: string
  fullname: string
  email: string
  avatar?: string
  bio?: string
  createdat: string
  facebook?: string
  youtube?: string
  spotify?: string
  applemusic?: string
  tiktok?: string
  instagram?: string
}
