import { NextResponse } from 'next/server'
import { multiDB } from '@/lib/multi-database-service'

export async function GET() {
    try {
        const result = await multiDB.getArtists()

        if (result.success) {
            const response = NextResponse.json({
                success: true,
                count: result.data.length,
                artists: result.data
            })

            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*')
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

            return response
        } else {
            const errorResponse = NextResponse.json({
                success: false,
                error: 'Failed to fetch artists',
                count: 0,
                artists: []
            }, { status: 500 })

            // Add CORS headers to error response
            errorResponse.headers.set('Access-Control-Allow-Origin', '*')
            return errorResponse
        }
    } catch (error) {
        console.error('Error fetching artists:', error)
        const errorResponse = NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch artists',
                count: 0,
                artists: []
            },
            { status: 500 }
        )

        errorResponse.headers.set('Access-Control-Allow-Origin', '*')
        return errorResponse
    }
}
