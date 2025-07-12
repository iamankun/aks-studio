import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"
import { getSession } from "@/lib/session"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    logger.info("Login attempt", { username }, { component: "LoginAPI" })

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

    console.log('DEBUG [Login Route]: Authentication result:', result);
    if (result.success && result.data) {
      logger.info("Login successful", { userId: result.data.id, source: result.source }, { component: "LoginAPI" })

      // Lưu thông tin user vào session
      const session = await getSession()
      session.user = result.data
      await session.save()

      return NextResponse.json(result)
    } else {
      logger.warn("Login failed", { username, reason: result.message }, { component: "LoginAPI" })
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Invalid credentials",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    logger.error("Login API error", error, { component: "LoginAPI" })
    return NextResponse.json(
      {
        success: false,
        message: "Login failed due to an internal server error.",
      },
      { status: 500 },
    )
  }
}
