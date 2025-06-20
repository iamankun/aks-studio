export interface User {
  id: string
  username: string
  password: string
  role: "Quản lý nhãn" | "Nghệ sĩ"
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
