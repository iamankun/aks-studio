import { createClient } from "@supabase/supabase-js"

// Supabase Configuration Object
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
}

// Storage buckets configuration
export const STORAGE_BUCKETS = {
  audio: "audio-files",
  images: "cover-images",
  documents: "documents",
}

// Helper functions
export function getStorageUrl(bucket: string, path: string) {
  return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${bucket}/${path}`
}

export function getS3Key(bucket: string, path: string) {
  return `${bucket}/${path}`
}

// S3 Client - only initialize on server side
export let s3Client: any = null

// Initialize S3 client only on server side
export async function initializeS3Client() {
  if (typeof window !== "undefined") {
    // Client side - return null
    return null
  }

  if (s3Client) {
    return s3Client
  }

  try {
    const { S3Client } = await import("@aws-sdk/client-s3")

    s3Client = new S3Client({
      forcePathStyle: true,
      region: "ap-southeast-1",
      endpoint: "https://vaxffiiwwwqfnjehleec.supabase.co/storage/v1/s3",
      credentials: {
        accessKeyId: "acbfd3507c26f4dfb6c85816e1af7241",
        secretAccessKey: "3f0f14d528ebfaa2410403b1695536897bb03451b8f549ccdf752498a81b88a9",
      },
    })

    console.log("✅ S3 Client initialized successfully")
    return s3Client
  } catch (error) {
    console.error("❌ Failed to initialize S3 Client:", error)
    return null
  }
}

// Sử dụng đúng environment variables từ Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log("🔍 Supabase Config Check:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  anonKey: supabaseAnonKey ? "✅ Set" : "❌ Missing",
  serviceKey: supabaseServiceKey ? "✅ Set" : "❌ Missing",
  urlValue: supabaseUrl,
})

// Client for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log("🔍 Testing Supabase connection...")

    const { data, error } = await supabaseAdmin.from("label_manager").select("username").limit(1)

    if (error) {
      console.error("❌ Supabase connection failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Supabase connection successful")
    return { success: true, data }
  } catch (error) {
    console.error("🚨 Supabase connection error:", error)
    return { success: false, error: error.message }
  }
}
