import { createClient } from "@/ultis/supabase/client"
import type { User } from "@/types/user"

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const supabase = createClient()

  try {
    console.log("🔍 Authenticating user:", { username, password: "***" })

    // Đầu tiên check bảng label_manager với exact matching
    const { data: labelManager, error: labelError } = await supabase
      .from("label_manager")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    console.log("🔍 Label Manager Query Result:", { labelManager, labelError })

    if (labelManager && !labelError) {
      console.log("✅ Found Label Manager:", labelManager)

      // Convert LabelManager to User format
      const user: User = {
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
      }

      console.log("🔍 Converted user object:", user)
      return user
    }

    // Nếu không tìm thấy trong label_manager, check bảng users (cho Artist)
    const { data: artist, error: artistError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()

    if (artist && !artistError) {
      console.log("✅ Found Artist:", artist)

      // For artists, you might want to implement proper password hashing
      // For now, we'll just return the artist data
      return {
        id: artist.id,
        username: artist.username,
        role: "Artist",
        full_name: artist.full_name,
        email: artist.email,
        avatar_url: artist.avatar_url,
        bio: artist.bio,
        social_links: artist.social_links,
        created_at: artist.created_at,
      }
    }

    console.log("❌ No user found with provided credentials")
    return null
  } catch (error) {
    console.error("🚨 Authentication error:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("❌ No authenticated user")
      return null
    }

    // Check if user is label manager
    const { data: labelManager } = await supabase.from("label_manager").select("*").eq("email", user.email).single()

    if (labelManager) {
      return {
        id: labelManager.id.toString(),
        username: labelManager.username,
        role: "Label Manager",
        full_name: labelManager.fullname,
        email: labelManager.email,
        avatar_url: labelManager.avatar,
        bio: labelManager.bio,
        social_links: {
          facebook: labelManager.facebook,
          youtube: labelManager.youtube,
          spotify: labelManager.spotify,
          appleMusic: labelManager.applemusic,
          tiktok: labelManager.tiktok,
          instagram: labelManager.instagram,
        },
        created_at: labelManager.createdat,
      }
    }

    // Check users table
    const { data: artist } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (artist) {
      return {
        id: artist.id,
        username: artist.username,
        role: "Artist",
        full_name: artist.full_name,
        email: artist.email,
        avatar_url: artist.avatar_url,
        bio: artist.bio,
        social_links: artist.social_links,
        created_at: artist.created_at,
      }
    }

    return null
  } catch (error) {
    console.error("🚨 Get current user error:", error)
    return null
  }
}
