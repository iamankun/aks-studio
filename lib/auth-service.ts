import { createClient } from "@supabase/supabase-js"
import type { User } from "@/types/user"

// Server-side Supabase client (for API routes only)
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Server-side only

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Client-side Supabase client (for client components)
function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export interface AuthResult {
  success: boolean
  user?: User
  message?: string
}

// Server-side authentication (for API routes)
export async function authenticateUserServer(username: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        message: "Database not configured",
      }
    }

    // Check label_manager table first
    const { data: labelManager, error: labelError } = await supabase
      .from("label_manager")
      .select("*")
      .eq("username", username)
      .eq("password", password) // In production, use proper password hashing
      .single()

    if (!labelError && labelManager) {
      return {
        success: true,
        user: {
          ...labelManager,
          password_hash: labelManager.password,
          role: "label_manager" as const,
        },
      }
    }

    // Check users table for artists
    const { data: artist, error: artistError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password_hash", password) // In production, use proper password hashing
      .single()

    if (!artistError && artist) {
      return {
        success: true,
        user: {
          ...artist,
          role: "artist" as const,
        },
      }
    }

    return {
      success: false,
      message: "Invalid credentials",
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      success: false,
      message: "Authentication failed",
    }
  }
}

// Client-side authentication (for client components)
export async function authenticateUserClient(username: string, password: string): Promise<AuthResult> {
  try {
    // For client-side, we'll call the API route instead of direct database access
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Client authentication error:", error)
    return {
      success: false,
      message: "Authentication failed",
    }
  }
}

// Fallback to localStorage for development
export function authenticateUserLocal(username: string, password: string): AuthResult {
  const defaultUsers: User[] = [
    {
      id: "1",
      username: "ankunstudio",
      password_hash: "admin",
      fullname: "An Kun Studio Digital Music Distribution",
      email: "admin@ankun.dev",
      avatar: "/face.png",
      bio: "",
      createdat: "2025-06-24 09:54:55.895016+00",
      role: "label_manager",
      facebook: "",
      youtube: "",
      spotify: "",
      applemusic: "",
      tiktok: "",
      instagram: "",
    },
  ]

  const user = defaultUsers.find((u) => u.username === username && u.password_hash === password)

  if (user) {
    return {
      success: true,
      user,
    }
  }

  return {
    success: false,
    message: "Invalid credentials",
  }
}

// Main authenticateUser function for backward compatibility
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    // Try server-side authentication first (if running on server)
    if (typeof window === "undefined") {
      const result = await authenticateUserServer(username, password)
      return result.success ? result.user || null : null
    }

    // For client-side, use client authentication
    const result = await authenticateUserClient(username, password)
    if (result.success && result.user) {
      return {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role === "label_manager" ? "Label Manager" : "Artist",
        full_name: result.user.fullname,
        email: result.user.email,
        avatar_url: result.user.avatar || "/face.png",
        bio: result.user.bio || "",
        social_links: {
          facebook: result.user.facebook || "",
          youtube: result.user.youtube || "",
          spotify: result.user.spotify || "",
          appleMusic: result.user.applemusic || "",
          tiktok: result.user.tiktok || "",
          instagram: result.user.instagram || "",
        },
        created_at: result.user.createdat || new Date().toISOString(),
      }
    }

    // Fallback to local authentication
    const localResult = authenticateUserLocal(username, password)
    if (localResult.success && localResult.user) {
      return {
        id: localResult.user.id,
        username: localResult.user.username,
        role: localResult.user.role === "label_manager" ? "Label Manager" : "Artist",
        full_name: localResult.user.fullname,
        email: result.user.email,
        avatar_url: localResult.user.avatar || "/face.png",
        bio: result.user.bio || "",
        social_links: {
          facebook: result.user.facebook || "",
          youtube: result.user.youtube || "",
          spotify: result.user.spotify || "",
          appleMusic: result.user.applemusic || "",
          tiktok: result.user.tiktok || "",
          instagram: result.user.instagram || "",
        },
        created_at: localResult.user.createdat || new Date().toISOString(),
      }
    }

    return null
  } catch (error) {
    console.error("🚨 Authentication error:", error)
    return null
  }
}
