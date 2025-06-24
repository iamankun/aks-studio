// Tôi là An Kun
import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";
import type { EmailDetails } from "@/lib/email";

// Bạn cần thiết lập các biến này trong môi trường Vercel của bạn
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

export async function POST(request: Request) {
  try {
    // Kiểm tra biến môi trường SMTP. Nếu thiếu, API sẽ không hoạt động.
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      console.error("Lỗi nghiêm trọng: Một hoặc nhiều biến môi trường SMTP không được cấu hình.");
      return NextResponse.json(
        { success: false, message: "Lỗi cấu hình server: Dịch vụ email không được thiết lập đúng cách." },
        { status: 500 }
      );
    }

    const emailDetails: EmailDetails = await request.json();

    // Kiểm tra các trường bắt buộc
    if (!emailDetails.to || !emailDetails.subject || (!emailDetails.textBody && !emailDetails.htmlBody)) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin email bắt buộc." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10), // Chuyển đổi sang số nguyên
      secure: SMTP_PORT === "587", // Sử dụng SSL nếu port là 587
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
      from: emailDetails.from || SMTP_FROM || SMTP_USER, // Sử dụng from từ client hoặc default, fallback về user
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
    return NextResponse.json({ success: false, message: "Lỗi gửi email từ server.", error: error.message }, { status: 500 });
  }
}
