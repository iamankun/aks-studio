import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { to, subject, textBody, htmlBody } = await request.json()

    console.log("🔍 Email API request:", { to, subject })

    if (!to || !subject) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address and subject are required",
        },
        { status: 400 },
      )
    }

    const result = await sendEmail({
      to,
      subject,
      textBody,
      htmlBody,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to send email",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🚨 Email API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Email send failed: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
