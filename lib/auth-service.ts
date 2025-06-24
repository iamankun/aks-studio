import { createClient } from "@supabase/supabase-js"
import type { User } from "@/types/user"

// Server-side Supabase client (for API routes only)
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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
    console.log("🔍 Server authentication for:", username)
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      console.log("❌ Supabase not configured, using fallback")
      return authenticateUserLocal(username, password)
    }

    // Check label_manager table first
    const { data: labelManager, error: labelError } = await supabase
      .from("label_manager")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    console.log("🔍 Label Manager Query:", { labelManager, labelError })

    if (!labelError && labelManager) {
      console.log("✅ Found Label Manager")
      return {
        success: true,
        user: {
          id: labelManager.id.toString(),
          username: labelManager.username,
          role: "Label Manager",
          full_name: labelManager.fullname,
          email: labelManager.email,
          avatar_url: labelManager.avatar || "/face.png",
          bio: labelManager.bio || "",
          social_links: {
            facebook: labelManager.facebook || "",
            youtube: labelManager.youtube || "",
            spotify: labelManager.spotify || "",
            appleMusic: labelManager.applemusic || "",
            tiktok: labelManager.tiktok || "",
            instagram: labelManager.instagram || "",
          },
          created_at: labelManager.createdat,
          background_settings: {
            type: labelManager.background_type || "gradient",
            gradient: labelManager.background_gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            video_url: labelManager.background_video_url || "",
            opacity: labelManager.background_opacity || 0.3,
            playlist: labelManager.background_playlist || "",
          },
        },
      }
    }

    // Check artist table
    const { data: artist, error: artistError } = await supabase
      .from("artist")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    console.log("🔍 Artist Query:", { artist, artistError })

    if (!artistError && artist) {
      console.log("✅ Found Artist")
      return {
        success: true,
        user: {
          id: artist.id.toString(),
          username: artist.username,
          role: "Artist",
          full_name: artist.fullname,
          email: artist.email,
          avatar_url: artist.avatar || "/face.png",
          bio: artist.bio || "",
          social_links: {
            facebook: artist.facebook || "",
            youtube: artist.youtube || "",
            spotify: artist.spotify || "",
            appleMusic: artist.applemusic || "",
            tiktok: artist.tiktok || "",
            instagram: artist.instagram || "",
          },
          created_at: artist.createdat,
        },
      }
    }

    console.log("❌ No user found")
    return {
      success: false,
      message: "Invalid credentials",
    }
  } catch (error) {
    console.error("🚨 Server authentication error:", error)
    return authenticateUserLocal(username, password)
  }
}

// Client-side authentication (for client components)
export async function authenticateUserClient(username: string, password: string): Promise<AuthResult> {
  try {
    console.log("🔍 Client authentication for:", username)

    // Call API route for authentication
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    const result = await response.json()
    console.log("🔍 API response:", result)

    return result
  } catch (error) {
    console.error("🚨 Client authentication error:", error)
    return authenticateUserLocal(username, password)
  }
}

// Fallback to localStorage for development
export function authenticateUserLocal(username: string, password: string): AuthResult {
  console.log("🔍 Local authentication for:", username)

  const defaultUsers: User[] = [
    {
      id: "1",
      username: "ankunstudio",
      role: "Label Manager",
      full_name: "An Kun Studio Digital Music Distribution",
      email: "admin@ankun.dev",
      avatar_url: "/face.png",
      bio: "",
      social_links: {
        facebook: "",
        youtube: "",
        spotify: "",
        appleMusic: "",
        tiktok: "",
        instagram: "",
      },
      created_at: "2025-06-24 09:54:55.895016+00",
      background_settings: {
        type: "video",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        video_url: "",
        opacity: 0.3,
        playlist:
          "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
      },
    },
  ]

  const user = defaultUsers.find((u) => u.username === username && password === "admin")

  if (user) {
    console.log("✅ Local authentication successful")
    return {
      success: true,
      user,
    }
  }

  console.log("❌ Local authentication failed")
  return {
    success: false,
    message: "Invalid credentials",
  }
}

// Main authenticateUser function for backward compatibility
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    console.log("🔍 Main authentication for:", username)

    // Try client-side authentication (calls API route)
    const result = await authenticateUserClient(username, password)

    if (result.success && result.user) {
      console.log("✅ Authentication successful:", result.user)
      return result.user
    }

    console.log("❌ Authentication failed:", result.message)
    return null
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
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return {
        success: false,
        message: "Database not configured",
      }
    }

    // Check if username or email already exists
    const { data: existing } = await supabase
      .from("artist")
      .select("id")
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single()

    if (existing) {
      return {
        success: false,
        message: "Username or email already exists",
      }
    }

    // Insert new artist
    const { data, error } = await supabase
      .from("artist")
      .insert([
        {
          username: userData.username,
          password: userData.password, // In production, hash this
          fullname: userData.fullname,
          email: userData.email,
          avatar: "/face.png",
          bio: "",
          facebook: "",
          youtube: "",
          spotify: "",
          applemusic: "",
          tiktok: "",
          instagram: "",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "Registration failed",
      }
    }

    return {
      success: true,
      message: "Registration successful",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "Registration failed",
    }
  }
}

// Get background settings for Label Manager
export async function getBackgroundSettings(userId: string): Promise<any> {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return {
        type: "video",
        playlist:
          "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
        opacity: 0.3,
      }
    }

    const { data } = await supabase
      .from("label_manager")
      .select("background_type, background_gradient, background_video_url, background_opacity, background_playlist")
      .eq("id", userId)
      .single()

    return {
      type: data?.background_type || "video",
      gradient: data?.background_gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      video_url: data?.background_video_url || "",
      opacity: data?.background_opacity || 0.3,
      playlist:
        data?.background_playlist ||
        "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
    }
  } catch (error) {
    console.error("Get background settings error:", error)
    return {
      type: "video",
      playlist:
        "PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO,PLrAKWdKgX5mxuE6w5DAR5NEeQrwunsSeO",
      opacity: 0.3,
    }
  }
}
