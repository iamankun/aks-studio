import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email is required",
                },
                { status: 400 },
            )
        }

        // Always return a generic success message for security reasons
        // regardless of whether the email exists or not
        try {
            // Use the email service instead of Supabase
            await sendEmail({
                to: email,
                subject: "Password Reset Request",
                textBody: "If you requested a password reset, please contact support to complete the process.",
                htmlBody: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password for An Kun Studio.</p>
            <p>Please contact our support team to complete this process.</p>
            <p>If you did not request a password reset, please ignore this email.</p>
          </div>
        `
            })
        } catch (error) {
            console.error("❌ Failed to send password reset email:", error)
            // Continue execution - we don't want to reveal if the email exists
        }

        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent",
        })
    } catch (error) {
        console.error("❌ Password reset request error:", error)
        // Return a generic success message even on error for security
        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent",
        })
    }
}
