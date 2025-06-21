// Tôi là An Kun
import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";
import type { EmailDetails } from "@/lib/email";

// Lấy thông tin SMTP từ biến môi trường (an toàn hơn)
// Bạn cần thiết lập các biến này trong môi trường Vercel của bạn
const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.mail.me.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? "587", 10);
const SMTP_USER = process.env.SMTP_USER ?? "admin@ankun.dev";
const SMTP_PASS = process.env.SMTP_PASS ?? "grsa-aaxz-midn-pjta";
const SMTP_FROM = process.env.SMTP_FROM ?? "ankunstudio@ankun.dev"; // Email người gửi mặc định

export async function POST(request: Request) {
  try {
    const emailDetails: EmailDetails = await request.json();

    // Kiểm tra các trường bắt buộc
    if (!emailDetails.to || !emailDetails.subject || (!emailDetails.textBody && !emailDetails.htmlBody)) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin email bắt buộc." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      // Thêm cấu hình TLS nếu cần, ví dụ cho một số nhà cung cấp
      // tls: {
      //   ciphers:'SSLv3'
      // }
    });

    const mailOptions = {
      from: emailDetails.from || SMTP_FROM, // Sử dụng from từ client hoặc default
      to: emailDetails.to,
      cc: emailDetails.cc,
      bcc: emailDetails.bcc,
      subject: emailDetails.subject,
      text: emailDetails.textBody,
      html: emailDetails.htmlBody,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: `Email đã được gửi thành công đến ${emailDetails.to}.` });
  } catch (error: any) {
    console.error("API Error sending email:", error);
    return NextResponse.json({ success: false, message: "Lỗi gửi email từ server.", error: error.message ?? error.toString() }, { status: 500 });
  }
}
