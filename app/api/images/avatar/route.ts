import { NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

// API endpoint để lấy ảnh từ database thay vì từ file system
// Sử dụng: /api/images/avatar?userId=123&type=artist

export async function GET(request: NextRequest) {
    try {
        // Lấy thông số từ query params
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId") as string
        const type = searchParams.get("type") as "artist" | "label_manager" || "artist"

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId parameter" },
                { status: 400 }
            )
        }

        // Lấy ảnh từ cơ sở dữ liệu
        const imageData = await multiDB.getUserAvatar(userId, type)

        if (!imageData.success) {
            // Nếu không tìm thấy hoặc có lỗi, trả về ảnh mặc định
            return NextResponse.redirect(new URL('/face.png', request.url))
        }

        // Trả về ảnh với đúng Content-Type
        return new NextResponse(imageData.data, {
            headers: {
                'Content-Type': imageData.mimeType || 'image/jpeg',
                'Cache-Control': 'public, max-age=3600' // Cache 1 giờ
            }
        })
    } catch (error: any) {
        console.error("Error fetching avatar from database:", error)
        return NextResponse.json(
            { error: error.message || "Unknown error" },
            { status: 500 }
        )
    }
}
