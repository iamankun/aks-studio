// This file should only be imported on the server (e.g., in API routes)
import "server-only"

import type { User } from "@/types/user"
import { sendEmail, type EmailDetails } from "@/lib/email"
import { neon, neonConfig } from "@neondatabase/serverless"

export async function registerUser(newUser: User): Promise<boolean> {
    const dbUrl = process.env.aksstudio_POSTGRES_URL || process.env.DATABASE_URL
    let isUserSavedSuccessfully = false

    if (dbUrl) {
        // Logic cho database thực
        neonConfig.fetchOptions = { cache: "no-store" }
        const sql = neon(dbUrl)
        try {
            await sql`
        INSERT INTO users (id, username, password, email, role, full_name, created_at) 
        VALUES (${newUser.id || `user_${Date.now()}`}, ${newUser.username}, ${newUser.password}, ${newUser.email
                }, ${newUser.role}, ${newUser.fullName}, ${newUser.createdAt || new Date().toISOString()})
      `
            isUserSavedSuccessfully = true
            console.log(`User ${newUser.username} registered in database.`)
        } catch (error) {
            console.error("Error registering user in database:", error)
            return false
        }
    } else {
        // Logic cho chế độ demo (không có database)
        console.warn("Database URL not configured. Simulating user registration for demo mode.")
        isUserSavedSuccessfully = true
    }

    if (isUserSavedSuccessfully) {
        // Gửi email chào mừng
        const welcomeEmail: EmailDetails = {
            from: process.env.SMTP_FROM || "ankunstudio@ankun.dev", // Sử dụng biến môi trường
            to: newUser.email,
            subject: `Chào mừng ${newUser.username || newUser.fullName} đến với AKs Studio!`,
            textBody: `Chào mừng bạn đến với nền tảng phân phối nhạc AKs Studio!\n\nTài khoản của bạn đã được tạo thành công.\nTên đăng nhập: ${newUser.username}\n\nChúc bạn có những trải nghiệm tuyệt vời!`,
            htmlBody: `<p>Chào mừng bạn đến với nền tảng phân phối nhạc <strong>AKs Studio</strong>!</p><p>Tài khoản của bạn đã được tạo thành công.</p><ul><li>Tên đăng nhập: ${newUser.username}</li></ul><p>Chúc bạn có những trải nghiệm tuyệt vời!</p>`,
        }
        try {
            const emailResult = await sendEmail(welcomeEmail)
            if (!emailResult.success) {
                console.error("Lỗi gửi email chào mừng:", emailResult.message)
                // Bạn có thể quyết định có coi đây là lỗi đăng ký hay không
            }
        } catch (error) {
            console.error("Lỗi nghiêm trọng khi gửi email chào mừng:", error)
        }
        return true // Đăng ký user thành công (ngay cả khi email có thể lỗi nhẹ)
    }
    return false // Đăng ký user thất bại
}

// Hàm đảm bảo người dùng admin mặc định tồn tại
export async function ensureDefaultAdminUser(): Promise<void> {
    const adminUsername = "admin"
    const adminRole = "Label Manager"
    const defaultAdminUser: User = {
        id: "admin-001", // ID này có thể cần được tạo tự động bởi DB
        username: adminUsername,
        // Trong thực tế, password nên được hash trước khi lưu vào DB
        password: "admin",
        email: "admin@example.com", // Sử dụng email từ SMTP_USER nếu muốn: "admin@ankun.dev"
        role: adminRole,
        fullName: "Admin User",
        createdAt: new Date().toISOString(),
    }

    // Kết nối database
    // Sử dụng biến môi trường được cung cấp trong Security.md
    const dbUrl = process.env.aksstudio_POSTGRES_URL || process.env.DATABASE_URL
    if (!dbUrl) {
        console.error("Database URL not configured. Skipping default admin user check in DB.")
        return
    }

    neonConfig.fetchOptions = { cache: "no-store" } // Đảm bảo dữ liệu luôn mới
    const sql = neon(dbUrl)

    try {
        const existingAdmin = await sql`SELECT id FROM users WHERE username = ${adminUsername} AND role = ${adminRole} LIMIT 1`

        if (existingAdmin.length === 0) {
            // Tạo user trong database
            // Lưu ý: Cấu trúc bảng 'users' của bạn cần khớp với các trường này.
            // ID có thể là SERIAL và tự tăng. Password nên được hash.
            await sql`INSERT INTO users (username, password, email, role, full_name, created_at, id) VALUES (${defaultAdminUser.username}, ${defaultAdminUser.password}, ${defaultAdminUser.email}, ${defaultAdminUser.role}, ${defaultAdminUser.fullName}, ${defaultAdminUser.createdAt}, ${defaultAdminUser.id})`
            console.log("Default admin user created in database.")
        }
    } catch (error) {
        console.error("Error ensuring default admin user in database:", error)
    }
}
