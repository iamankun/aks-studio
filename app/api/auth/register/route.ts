import { NextResponse } from "next/server"
import { createClient } from "@/ultis/supabase/server"

export async function POST(request: Request) {
  try {
    const { username, email, password, full_name } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Tên đăng nhập, email, và mật khẩu là bắt buộc." }, { status: 400 })
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .or(`username.eq.${username},email.eq.${email}`)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: "Tên đăng nhập hoặc email đã tồn tại." }, { status: 400 })
    }

    // Create new user
    const { data, error } = await supabase.from("users").insert([
      {
        username,
        email,
        full_name: full_name || username,
        avatar_url: "/face.png",
        bio: "",
        social_links: {},
      },
    ])

    if (error) {
      console.error("Registration error:", error)
      return NextResponse.json({ message: "Không thể đăng ký người dùng." }, { status: 500 })
    }

    return NextResponse.json({ message: "Đăng ký thành công!" }, { status: 201 })
  } catch (error) {
    console.error("API Registration Error:", error)
    return NextResponse.json({ message: "Đã xảy ra lỗi không mong muốn từ server." }, { status: 500 })
  }
}
