import { NextResponse, type NextRequest } from 'next/server'
import { multiDB } from '@/lib/multi-database-service'
import { logger } from '@/lib/logger'

/**
 * Hàm helper để thêm các header CORS tiêu chuẩn vào response.
 * @param response Đối tượng NextResponse cần chỉnh sửa.
 * @returns Đối tượng NextResponse đã được chỉnh sửa.
 */
function addCorsHeaders(response: NextResponse): NextResponse {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
}

export async function GET(request: NextRequest) {
    try {
        const result = await multiDB.getArtists()

        if (result.success) {
            const response = NextResponse.json({
                success: true,
                count: result.data?.length ?? 0,
                artists: result.data ?? []
            })
            return addCorsHeaders(response)
        } else {
            logger.warn('Failed to fetch artists from multiDB', { error: result.message, component: 'ArtistsApi' })
            const errorResponse = NextResponse.json({
                success: false,
                message: result.message || 'Failed to fetch artists from the database.'
            }, { status: 500 })
            return addCorsHeaders(errorResponse)
        }
    } catch (error) {
        logger.error('Error in GET /api/artists', error, { component: 'ArtistsApi' })
        const errorResponse = NextResponse.json({
            success: false,
            message: 'An internal server error occurred.',
        }, { status: 500 })
        return addCorsHeaders(errorResponse)
    }
}

/**
 * Xử lý các request CORS preflight.
 */
export async function OPTIONS(request: NextRequest) {
    const response = new NextResponse(null, { status: 204 })
    return addCorsHeaders(response)
}
