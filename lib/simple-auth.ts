// Đơn giản hóa authentication - chỉ localStorage
export interface User {
  id: string
  username: string
  role: string
  full_name: string
  email: string
  avatar_url: string
  bio: string
  social_links: {
    facebook: string
    youtube: string
    spotify: string
    appleMusic: string
    tiktok: string
    instagram: string
  }
  created_at: string
  background_settings?: {
    type: string
    gradient: string
    video_url: string
    opacity: number
    playlist: string
  }
}

export function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem("aks_user")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  try {
    localStorage.setItem("aks_user", JSON.stringify(user))
  } catch (error) {
    console.error("Failed to store user:", error)
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem("aks_user")
  } catch (error) {
    console.error("Failed to clear user:", error)
  }
}

export function authenticateUser(username: string, password: string): User | null {
  // Chỉ 1 tài khoản admin duy nhất
  if (username === "ankunstudio" && password === "admin") {
    return {
      id: "1",
      username: "ankunstudio",
      role: "Label Manager",
      full_name: "An Kun Studio Digital Music Distribution",
      email: "admin@ankun.dev",
      avatar_url: "/face.png",
      bio: "Digital Music Distribution Platform",
      social_links: {
        facebook: "",
        youtube: "",
        spotify: "",
        appleMusic: "",
        tiktok: "",
        instagram: "",
      },
      created_at: new Date().toISOString(),
      background_settings: {
        type: "video",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        video_url: "",
        opacity: 0.3,
        playlist: "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
      },
    }
  }
  return null
}
