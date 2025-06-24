import { createClient } from "@supabase/supabase-js"

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
