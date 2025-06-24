import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    console.log("🔍 Forgot password request for:", email)

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    if (!supabase) {
      // Fallback: Send email using SMTP
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            subject: "Đặt lại mật khẩu - AKs Studio",
            textBody: `
Xin chào,

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AKs Studio.

Vui lòng liên hệ với chúng tôi qua email admin@ankun.dev để được hỗ trợ đặt lại mật khẩu.

Trân trọng,
An Kun Studio Digital Music Distribution
          `,
            htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8b5cf6;">Đặt lại mật khẩu - AKs Studio</h2>
  <p>Xin chào,</p>
  <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AKs Studio.</p>
  <p>Vui lòng liên hệ với chúng tôi qua email <strong>admin@ankun.dev</strong> để được hỗ trợ đặt lại mật khẩu.</p>
  <br>
  <p>Trân trọng,<br>
  <strong>An Kun Studio Digital Music Distribution</strong></p>
</div>
          `,
          }),
        },
      )

      const emailResult = await emailResponse.json()

      if (emailResult.success) {
        return NextResponse.json({
          success: true,
          message: "Email hướng dẫn đặt lại mật khẩu đã được gửi",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Không thể gửi email",
          },
          { status: 500 },
        )
      }
    }

    // Check if email exists in either table
    const { data: labelManager } = await supabase.from("label_manager").select("email").eq("email", email).single()

    const { data: artist } = await supabase.from("artist").select("email").eq("email", email).single()

    if (!labelManager && !artist) {
      return NextResponse.json(
        {
          success: false,
          message: "Email không tồn tại trong hệ thống",
        },
        { status: 404 },
      )
    }

    // Send reset email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Đặt lại mật khẩu - AKs Studio",
        textBody: `
Xin chào,

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AKs Studio.

Vui lòng liên hệ với chúng tôi qua email admin@ankun.dev để được hỗ trợ đặt lại mật khẩu.

Trân trọng,
An Kun Studio Digital Music Distribution
        `,
        htmlBody: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #8b5cf6;">Đặt lại mật khẩu - AKs Studio</h2>
  <p>Xin chào,</p>
  <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản AKs Studio.</p>
  <p>Vui lòng liên hệ với chúng tôi qua email <strong>admin@ankun.dev</strong> để được hỗ trợ đặt lại mật khẩu.</p>
  <br>
  <p>Trân trọng,<br>
  <strong>An Kun Studio Digital Music Distribution</strong></p>
</div>
        `,
      }),
    })

    const emailResult = await emailResponse.json()

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Email hướng dẫn đặt lại mật khẩu đã được gửi",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể gửi email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🚨 Forgot password API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
