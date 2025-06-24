import { NextResponse } from "next/server"
import { authenticateUserServer } from "@/lib/auth-service"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("🔍 Login API request for:", username)

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    const result = await authenticateUserServer(username, password)

    console.log("🔍 Authentication result:", {
      success: result.success,
      hasUser: !!result.user,
      debug: result.debug,
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error("🚨 Login API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
