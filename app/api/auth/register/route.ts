import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, full_name } = await request.json()

    console.log("📝 Multi-DB Registration attempt:", { username, email, full_name })

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username, email, and password are required",
        },
        { status: 400 },
      )
    }

    const result = await multiDB.createUser({
      username,
      email,
      password,
      fullName: full_name,
      role: "Artist",
    })

    if (result.success) {
      console.log("✅ User registered successfully via:", result.source)
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Registration failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed due to server error",
      },
      { status: 500 },
    )
  }
}
