import { NextResponse } from "next/server"

// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

export async function GET() {
    try {
        const API_KEY = process.env.API_KEY || ""
        const AI_ENDPOINT = process.env.AI_ENDPOINT || "https://api.deepseek.com/v1/chat/completions"
        const ENV = process.env.NODE_ENV || "development"

        // Kiểm tra các điều kiện cần thiết
        if (!API_KEY) {
            return NextResponse.json({
                status: "error",
                code: "MISSING_API_KEY",
                message: "Thiếu API Key cho AI service",
                timestamp: new Date().toISOString()
            }, { status: 401 })
        }

        if (!AI_ENDPOINT) {
            return NextResponse.json({
                status: "error",
                code: "MISSING_ENDPOINT",
                message: "Thiếu endpoint cho AI service",
                timestamp: new Date().toISOString()
            }, { status: 400 })
        }

        // Lấy tất cả env liên quan đến AI để debug
        const aiEnvKeys = Object.keys(process.env)
            .filter(key => key.includes('API') || key.includes('AI'))

        const response = NextResponse.json({
            status: "success",
            timestamp: new Date().toISOString(),
            environment: ENV,
            apiKeyExists: !!API_KEY,
            endpoint: AI_ENDPOINT,
            usingDefaultEndpoint: AI_ENDPOINT === "https://api.deepseek.com/v1/chat/completions",
            aiEnvKeys,
            aiConfig: {
                model: process.env.AI_MODEL || "default",
                version: process.env.AI_VERSION || "latest",
                temperature: process.env.AI_TEMPERATURE || "0.7"
            }
        })

        // Headers cơ bản
        response.headers.set('X-Content-Type-Options', 'nosniff')
        response.headers.set('X-Frame-Options', 'DENY')

        return response

    } catch (error) {
        console.error("Debug config error:", error)

        // Phân loại lỗi để trả về mã lỗi phù hợp
        if (error instanceof TypeError) {
            return NextResponse.json({
                status: "error",
                code: "TYPE_ERROR",
                message: "Lỗi kiểu dữ liệu khi xử lý cấu hình",
                timestamp: new Date().toISOString()
            }, { status: 400 })
        }

        if (error instanceof ReferenceError) {
            return NextResponse.json({
                status: "error",
                code: "REFERENCE_ERROR",
                message: "Lỗi tham chiếu biến không tồn tại",
                timestamp: new Date().toISOString()
            }, { status: 500 })
        }

        // Lỗi mặc định
        return NextResponse.json({
            status: "error",
            code: "INTERNAL_ERROR",
            message: "Có lỗi xảy ra khi lấy thông tin cấu hình",
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
