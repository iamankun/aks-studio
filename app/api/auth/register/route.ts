// Tôi là An Kun
import { NextResponse } from "next/server"
import { registerUser } from "@/lib/server-actions"
import type { User } from "@/types/user"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json()

        if (!username || !email || !password) {
            return NextResponse.json({ message: "Tên đăng nhập, email, và mật khẩu là bắt buộc." }, { status: 400 })
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10) // 10 is the salt rounds

        // Tạo một đối tượng người dùng mới với các giá trị mặc định
        const newUser: User = {
            id: `user_${Date.now()}`, // Lưu ý: Trong ứng dụng thực tế, nên dùng UUID
            username,
            passwordHash: hashedPassword,
            email,
            role: "Artist", // Vai trò mặc định cho người dùng mới
            fullName: username, // Mặc định tên đầy đủ là tên đăng nhập
            createdAt: new Date().toISOString(),
        }

        const success = await registerUser(newUser)

        if (success) {
            return NextResponse.json(
                { message: "Đăng ký thành công! Vui lòng kiểm tra email chào mừng." },
                { status: 201 },
            )
        } else {
            // Lỗi này có thể do kết nối DB hoặc các vấn đề phía server
            return NextResponse.json(
                { message: "Không thể đăng ký người dùng. Có thể tên đăng nhập hoặc email đã tồn tại." },
                { status: 500 },
            )
        }
    } catch (error) {
        console.error("API Registration Error:", error)
        // Tránh lộ chi tiết lỗi của server ra ngoài
        return NextResponse.json({ message: "Đã xảy ra lỗi không mong muốn từ server." }, { status: 500 })
    }
}
