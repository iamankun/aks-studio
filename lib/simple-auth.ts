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
  // Tài khoản admin mặc định
  if (username === "ankunstudio" && password === "admin") {
    return {
      id: "1",
      username: "ankunstudio",
      role: "Label Manager",
      fullName: "An Kun Studio Digital Music Distribution",
      email: "ankunstudio@ankun.dev",
      avatar: "/face.png",
      bio: "Digital Music Distribution Platform for independent artists and labels",
      socialLinks: {
        facebook: "https://facebook.com/ankunstudio",
        youtube: "https://youtube.com/@ankunstudio",
        spotify: "https://open.spotify.com/artist/ankunstudio",
        appleMusic: "https://music.apple.com/artist/ankunstudio",
        tiktok: "https://tiktok.com/@ankunstudio",
        instagram: "https://instagram.com/ankunstudio",
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
