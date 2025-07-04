// Active: 1750877192019@@ep-mute - rice - a17ojtca - pooler.ap - southeast - 1.aws.neon.tech@5432@aksstudio
// Tôi là An Kun
// Hỗ trợ dự án, Copilot, Gemini
// Tác giả kiêm xuất bản bởi An Kun Studio Digital Music

import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"
import { AuthorizationService } from "@/lib/authorization-service"
import { authenticateUser } from "@/lib/auth-service"
import type { User } from "@/types/user"

// Helper function để lấy user từ request
async function getUserFromRequest(request: NextRequest): Promise<User | null> {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader) return null

        const [type, credentials] = authHeader.split(' ')
        if (type !== 'Basic') return null

        const [username, password] = Buffer.from(credentials, 'base64').toString().split(':')

        const authResult = await authenticateUser(username, password)
        return authResult.success ? authResult.user || null : null
    } catch {
        return null
    }
}

// GET /api/submissions/statistics - Lấy thống kê submissions
export async function GET(request: NextRequest) {
    try {
        console.log("📊 Getting submissions statistics")

        // Lấy user hiện tại từ request
        const currentUser = await getUserFromRequest(request)

        if (!currentUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Authentication required",
                },
                { status: 401 },
            )
        }

        // Lấy tất cả submissions (sẽ được filter theo quyền)
        const result = await multiDB.getSubmissions()

        if (result.success) {
            // Generate statistics dựa trên quyền của user
            const statistics = AuthorizationService.generateUserStatistics(
                currentUser,
                result.data
            )

            console.log(`✅ Statistics generated for ${currentUser.role}:`, {
                total: statistics.total,
                userRole: statistics.userRole
            })

            const response = NextResponse.json({
                success: true,
                statistics,
                generatedAt: new Date().toISOString()
            })

            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

            return response
        } else {
            const errorResponse = NextResponse.json(
                {
                    success: false,
                    message: "Failed to retrieve statistics",
                },
                { status: 500 },
            )

            errorResponse.headers.set('Access-Control-Allow-Origin', '*')
            return errorResponse
        }
    } catch (error) {
        console.error("❌ Get statistics error:", error)
        const errorResponse = NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve statistics",
            },
            { status: 500 },
        )

        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        return errorResponse
    }
}

// OPTIONS method cho CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
