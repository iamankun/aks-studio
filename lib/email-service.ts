import { shouldUseRealSMTP } from "@/lib/app-config"

// Email Service - chỉ sử dụng SMTP_ environment variables
export const SMTP_CONFIG = {
  host: process.env.SMTP_HOST!,
  port: Number.parseInt(process.env.SMTP_PORT!),
  user: process.env.SMTP_USER!,
  pass: process.env.SMTP_PASS!,
  from: process.env.SMTP_FROM!,
  name: process.env.SMTP_NAME!,
}

export interface EmailOptions {
  to: string
  subject: string
  textBody?: string
  htmlBody?: string
}

export async function sendEmail(options: EmailOptions) {
  const useRealSMTP = shouldUseRealSMTP()

  try {
    console.log("🔍 Sending email to:", options.to)
    console.log("🔍 Mode:", useRealSMTP ? 'Real SMTP' : 'Demo Mode')
    console.log("🔍 Raw ENV values:", {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_FROM: process.env.SMTP_FROM,
    })

    if (!useRealSMTP) {
      // Demo mode: Just log the email
      console.log("🎮 Demo Mode - Email would be sent:", {
        to: options.to,
        subject: options.subject,
        textBody: options.textBody?.substring(0, 100) + (options.textBody && options.textBody.length > 100 ? '...' : ''),
        htmlBody: options.htmlBody ? 'HTML content provided' : 'No HTML content'
      })

      return {
        success: true,
        messageId: `demo-${Date.now()}`,
        message: 'Email queued successfully (Demo Mode)'
      }
    }

    console.log("🔍 SMTP Config:", {
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      user: SMTP_CONFIG.user,
      from: SMTP_CONFIG.from,
    })

    // Import nodemailer dynamically
    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.port === 465,
      auth: {
        user: SMTP_CONFIG.user,
        pass: SMTP_CONFIG.pass,
      },
    })

    const mailOptions = {
      from: `${SMTP_CONFIG.name} <${SMTP_CONFIG.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.textBody,
      html: options.htmlBody,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log("✅ Email sent successfully:", result.messageId)
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    }
  } catch (error) {
    console.error("🚨 Email send error:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage,
      message: `Failed to send email: ${errorMessage}`
    }
  }
}
