import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("🔐 Multi-DB Login attempt for:", username)

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    const result = await multiDB.authenticateUser(username, password)

    if (result.success) {
      console.log("✅ Authentication successful via:", result.source)
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Invalid credentials",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Login failed due to server error",
      },
      { status: 500 },
    )
  }
}
