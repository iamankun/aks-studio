import { supabaseAdmin } from "./supabase-config"

export interface DatabaseResult<T = any> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

// Test database connection với schema public
export async function testDatabaseConnection(): Promise<DatabaseResult> {
  try {
    console.log("🔍 Testing database connection to public schema...")

    // Test với query đơn giản nhất
    const { data, error } = await supabaseAdmin.from("label_manager").select("username").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log("✅ Database connection successful, found data:", data)
    return {
      success: true,
      data,
      count: data?.length || 0,
    }
  } catch (error) {
    console.error("🚨 Database connection error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Get user by credentials - chỉ query từ public schema
export async function getUserByCredentials(username: string, password: string): Promise<DatabaseResult<any>> {
  try {
    console.log("🔍 Getting user from public.label_manager:", username)

    // Chỉ query label_manager table trong public schema
    const { data: labelManager, error: labelError } = await supabaseAdmin
      .from("label_manager")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle()

    if (labelError) {
      console.error("❌ Label manager query error:", labelError)
      return {
        success: false,
        error: labelError.message,
      }
    }

    if (labelManager) {
      console.log("✅ Found label manager:", labelManager.username)
      return {
        success: true,
        data: { ...labelManager, table: "label_manager" },
      }
    }

    // Nếu không tìm thấy trong label_manager, thử artist
    console.log("🔍 Getting user from public.artist:", username)

    const { data: artist, error: artistError } = await supabaseAdmin
      .from("artist")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle()

    if (artistError) {
      console.error("❌ Artist query error:", artistError)
      return {
        success: false,
        error: artistError.message,
      }
    }

    if (artist) {
      console.log("✅ Found artist:", artist.username)
      return {
        success: true,
        data: { ...artist, table: "artist" },
      }
    }

    console.log("❌ No user found with credentials")
    return {
      success: false,
      error: "Invalid credentials",
    }
  } catch (error) {
    console.error("🚨 Get user error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Create new artist trong public schema
export async function createArtist(userData: {
  username: string
  password: string
  email: string
  fullname: string
}): Promise<DatabaseResult> {
  try {
    console.log("🔍 Creating new artist in public.artist:", userData.username)

    // Check if username or email exists
    const { data: existing } = await supabaseAdmin
      .from("artist")
      .select("id")
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: "Username or email already exists",
      }
    }

    const { data, error } = await supabaseAdmin
      .from("artist")
      .insert([
        {
          username: userData.username,
          password: userData.password,
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
      console.error("❌ Create artist error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    console.log("✅ Artist created successfully")
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("🚨 Create artist error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
