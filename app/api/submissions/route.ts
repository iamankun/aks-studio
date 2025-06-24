import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      // Fallback to localStorage data (return empty array for server-side)
      return NextResponse.json({
        success: true,
        data: [],
        message: "Supabase not configured, using client-side storage",
      })
    }

    // Continue with existing Supabase logic...
    const { createClient } = require("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({
        success: false,
        message: `Lỗi database: ${error.message}`,
        data: [],
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      message: "Submissions loaded successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({
      success: false,
      message: "Lỗi server không xác định",
      data: [],
    })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: true,
        message: "Submission saved locally (Supabase not configured)",
      })
    }

    // Continue with existing Supabase logic for POST...
    const body = await request.json()
    const { createClient } = require("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.from("submissions").insert([body]).select()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({
        success: false,
        message: `Lỗi lưu database: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: "Submission saved successfully",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({
      success: false,
      message: "Lỗi server không xác định",
    })
  }
}
