import { NextResponse } from "next/server"
import { registerArtist } from "@/lib/auth-service"

export async function POST(request: Request) {
  try {
    const { username, email, password, full_name } = await request.json()

    console.log("🔍 Registration request:", { username, email, full_name })

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Tên đăng nhập, email, và mật khẩu là bắt buộc.",
        },
        { status: 400 },
      )
    }

    const result = await registerArtist({
      username,
      password,
      email,
      fullname: full_name || username,
    })

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Đăng ký thành công!",
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Không thể đăng ký người dùng.",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("🚨 API Registration Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Đã xảy ra lỗi không mong muốn từ server.",
      },
      { status: 500 },
    )
  }
}
