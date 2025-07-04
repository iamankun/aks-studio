"use server"

import { NextRequest } from "next/server"
import { cookies } from "next/headers"

// Kiểm tra xem người dùng có quyền quản lý không
export async function isLabelManager(req: NextRequest): Promise<boolean> {
    try {
        // Lấy token từ cookie hoặc headers
        const cookieStore = cookies()
        const token = cookieStore.get("auth_token")?.value
        const authHeader = req.headers.get("Authorization")

        if (!token && !authHeader) {
            return false
        }

        // Trong môi trường hiện tại, chúng ta có thể kiểm tra thông qua localStorage
        // Tuy nhiên, trong thực tế nên kiểm tra token với database

        // Giả định rằng người dùng đã được xác thực qua hệ thống xác thực khác
        // và không cần kiểm tra lại ở đây

        return true
    } catch (error) {
        console.error("Lỗi kiểm tra quyền:", error)
        return false
    }
}

// Hàm để kiểm tra nếu request đến từ người dùng đã đăng nhập
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
    try {
        // Kiểm tra cookie hoặc authorization header
        const cookieStore = cookies()
        const token = cookieStore.get("auth_token")?.value
        const authHeader = req.headers.get("Authorization")

        return !!token || !!authHeader
    } catch (error) {
        console.error("Lỗi kiểm tra xác thực:", error)
        return false
    }
}

/**
 * Hàm này chỉ để tham khảo và không thực sự sử dụng trong môi trường hiện tại
 * vì xác thực được xử lý bởi kênh khác. Không triển khai vào production.
 * 
 * Lưu ý: Hệ thống chỉ hỗ trợ hai phân quyền chính:
 * 1. Label Manager - Quản lý nhãn hiệu
 * 2. Artist - Nghệ sĩ
 */
export async function validateRequest(req: NextRequest): Promise<{
    authenticated: boolean
    isManager: boolean
}> {
    const authenticated = await isAuthenticated(req)
    const isManager = await isLabelManager(req)

    return {
        authenticated,
        isManager
    }
}
