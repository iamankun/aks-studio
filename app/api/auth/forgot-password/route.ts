import { NextResponse } from "next/server"
import { MultiDatabaseService } from "@/lib/multi-database-service"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    logger.info("Forgot password request", { email }, { component: "ForgotPasswordAPI" })

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 },
      )
    }

    const dbService = new MultiDatabaseService()
    await dbService.initialize()

    // Try to find the user by email
    const user = await dbService.findUserByEmail(email)

    // Check if user exists - but don't reveal this in the response
    if (user) {
      logger.info("User found for password reset", { email }, { component: "ForgotPasswordAPI" })
    } else {
      logger.warn("User not found for password reset", { email }, { component: "ForgotPasswordAPI" })
    }

    // Always send reset email regardless of whether user exists (security best practice)
    const emailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/send-email`,
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
      }
    )

    const emailResult = await emailResponse.json()

    if (emailResult.success) {
      logger.info("Reset password email sent successfully", { email }, { component: "ForgotPasswordAPI" })
      return NextResponse.json({
        success: true,
        message: "Email hướng dẫn đặt lại mật khẩu đã được gửi",
      })
    } else {
      logger.error("Failed to send reset password email", emailResult, { component: "ForgotPasswordAPI" })
      return NextResponse.json(
        {
          success: false,
          message: "Không thể gửi email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    logger.error("Forgot password API error", error, { component: "ForgotPasswordAPI" })
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
