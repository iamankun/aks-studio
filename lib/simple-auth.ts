// Đơn giản hóa authentication - chỉ localStorage
export interface User {
  id: string
  username: string
  role: string
  fullName: string
  email: string
  avatar: string
  bio: string
  socialLinks: {
    facebook: string
    youtube: string
    spotify: string
    appleMusic: string
    tiktok: string
    instagram: string
  }
  createdAt: string
  isrcCodePrefix?: string
  backgroundSettings?: {
    type: string
    gradient: string
    videoUrl: string
    opacity: number
    playlist: string
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem("aks_user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem("aks_user", JSON.stringify(user))
  } catch (error) {
    console.error("Failed to store user:", error)
  }
}

export function clearUser(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem("aks_user")
  } catch (error) {
    console.error("Failed to clear user:", error)
  }
}

export function authenticateUser(username: string, password: string): User | null {
  // Tài khoản admin mặc định - chỉ dùng cho môi trường phát triển
  // Trong môi trường production, hãy thay đổi logic này để sử dụng xác thực thực tế
  if (username === "admin" && password === "adminpassword") {
    return {
      id: "1",
      username: "admin",
      role: "Label Manager", 
      fullName: "Administrator",
      email: "admin@yourdomain.com",
      avatar: "/face.png",
      bio: "Digital Music Distribution Platform for independent artists and labels",
      socialLinks: {
        facebook: "",
        youtube: "",
        spotify: "",
        appleMusic: "",
        tiktok: "",
        instagram: "",
      },
      createdAt: new Date().toISOString(),
      isrcCodePrefix: "VNA2P",
      backgroundSettings: {
        type: "video",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        videoUrl: "",
        opacity: 0.3,
        playlist: "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
      },
    }
  }

  // Có thể thêm logic check database ở đây
  return null
}

export function updateUser(userData: Partial<User>): boolean {
  const currentUser = getStoredUser()
  if (!currentUser) return false

  const updatedUser = { ...currentUser, ...userData }
  storeUser(updatedUser)
  return true
}
