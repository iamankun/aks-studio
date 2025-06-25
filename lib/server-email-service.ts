// Server-only email service
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

export async function sendEmailServer(options: EmailOptions) {
  // Only run on server side
  if (typeof window !== "undefined") {
    throw new Error("Email service can only be used on server side")
  }

  try {
    console.log("🔍 Sending email to:", options.to)

    // Dynamic import to avoid client-side bundling
    const nodemailer = await import("nodemailer")

    const transporter = nodemailer.createTransporter({
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
    }
  } catch (error) {
    console.error("🚨 Email send error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
