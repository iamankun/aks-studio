import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { to, cc, bcc, subject, textBody, htmlBody } = await request.json()

    // Validate required fields
    if (!to || !subject || (!textBody && !htmlBody)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: to, subject, and body" },
        { status: 400 },
      )
    }

    // Validate environment variables
    const requiredEnvVars = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "SMTP_FROM_NAME"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      console.error("❌ Missing SMTP environment variables:", missingVars)
      return NextResponse.json(
        { success: false, message: `Missing SMTP configuration: ${missingVars.join(", ")}` },
        { status: 500 },
      )
    }

    console.log("📧 Configuring SMTP with:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM,
      fromName: process.env.SMTP_FROM_NAME,
    })

    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // false for 587, true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        ciphers: "SSLv3",
      },
    })

    // Verify connection
    try {
      await transporter.verify()
      console.log("✅ SMTP connection verified")
    } catch (verifyError) {
      console.error("❌ SMTP verification failed:", verifyError)
      return NextResponse.json({ success: false, message: "SMTP configuration error" }, { status: 500 })
    }

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject: subject,
      text: textBody,
      html: htmlBody || textBody,
    })

    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      to: to,
      subject: subject,
    })

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("🚨 Email sending error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
