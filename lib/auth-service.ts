import { testDatabaseConnection, getUserByCredentials, createArtist } from "./database-service"
import type { User } from "@/types/user"

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
  debug?: any
}

// Server-side authentication - đơn giản hóa
export async function authenticateUserServer(username: string, password: string): Promise<AuthResult> {
  try {
    console.log("🔍 Server authentication for:", username)

    // Test database connection trước
    const dbTest = await testDatabaseConnection()
    console.log("🔍 Database test result:", dbTest)

    if (!dbTest.success) {
      console.log("❌ Database not connected, using fallback")
      return authenticateUserLocal(username, password)
    }

    // Get user từ database
    const userResult = await getUserByCredentials(username, password)

    if (userResult.success && userResult.data) {
      const userData = userResult.data
      const isLabelManager = userData.table === "label_manager"

      console.log(`✅ Found ${isLabelManager ? "Label Manager" : "Artist"}:`, userData.username)

      const user: User = {
        id: userData.id.toString(),
        username: userData.username,
        role: isLabelManager ? "Label Manager" : "Artist",
        full_name: userData.fullname,
        email: userData.email,
        avatar_url: userData.avatar || "/face.png",
        bio: userData.bio || "",
        social_links: {
          facebook: userData.facebook || "",
          youtube: userData.youtube || "",
          spotify: userData.spotify || "",
          appleMusic: userData.applemusic || "",
          tiktok: userData.tiktok || "",
          instagram: userData.instagram || "",
        },
        created_at: userData.createdat,
        ...(isLabelManager && {
          background_settings: {
            type: userData.background_type || "video",
            gradient: userData.background_gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            video_url: userData.background_video_url || "",
            opacity: userData.background_opacity || 0.3,
            playlist: userData.background_playlist || "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
          },
        }),
      }

      return {
        success: true,
        user,
        debug: { source: "database", table: userData.table },
      }
    }

    console.log("❌ No user found in database, using fallback")
    return authenticateUserLocal(username, password)
  } catch (error) {
    console.error("🚨 Server authentication error:", error)
    return authenticateUserLocal(username, password)
  }
}

// Fallback authentication - chỉ 1 tài khoản admin
export function authenticateUserLocal(username: string, password: string): AuthResult {
  console.log("🔍 Local fallback authentication for:", username)

  // CHỈ 1 TÀI KHOẢN ADMIN DUY NHẤT
  if (username === "ankunstudio" && password === "admin") {
    console.log("✅ Local authentication successful")

    const user: User = {
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
      created_at: "2025-06-24T09:54:55.895016+00:00",
      background_settings: {
        type: "video",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        video_url: "",
        opacity: 0.3,
        playlist: "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
      },
    }

    return {
      success: true,
      user,
      debug: { source: "fallback", credentials: "ankunstudio/admin" },
    }
  }

  console.log("❌ Local authentication failed")
  return {
    success: false,
    message: "Invalid credentials",
    debug: {
      source: "fallback",
      provided: { username, password },
      expected: { username: "ankunstudio", password: "admin" },
    },
  }
}

// Main authentication function
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    console.log("🔍 Main authentication for:", username)

    // For client-side, call API route
    if (typeof window !== "undefined") {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()
      console.log("🔍 API response:", result)

      if (result.success && result.user) {
        return result.user
      }

      return null
    }

    // For server-side, call directly
    const result = await authenticateUserServer(username, password)
    return result.success ? result.user || null : null
  } catch (error) {
    console.error("🚨 Main authentication error:", error)
    return null
  }
}

// Register new artist
export async function registerArtist(userData: {
  username: string
  password: string
  email: string
  fullname: string
}): Promise<AuthResult> {
  try {
    console.log("🔍 Registering new artist:", userData.username)

    const result = await createArtist(userData)

    if (result.success) {
      return {
        success: true,
        message: "Registration successful",
      }
    } else {
      return {
        success: false,
        message: result.error || "Registration failed",
      }
    }
  } catch (error) {
    console.error("🚨 Registration error:", error)
    return {
      success: false,
      message: `Registration failed: ${error.message}`,
    }
  }
}
