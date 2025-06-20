export interface User {
  id: string
  username: string
  passwordHash?: string // Hoặc password_hash tùy theo quy ước đặt tên của bạn
  role: "Label Manager" | "Artist"
  fullName: string
  email: string
  avatar?: string
  bio?: string
  socialLinks?: {
    facebook?: string
    youtube?: string
    spotify?: string
    appleMusic?: string
    tiktok?: string
    instagram?: string
  }
  isrcCodePrefix?: string
  createdAt: string
}
