import { NextResponse } from 'next/server'
import { multiDB } from '@/lib/multi-database-service'

export async function GET() {
    try {
        const result = await multiDB.getArtists()

        if (result.success) {
            return NextResponse.json({
                success: true,
                count: result.data.length,
                artists: result.data
            })
        } else {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch artists',
                count: 0,
                artists: []
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Error fetching artists:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch artists',
                count: 0,
                artists: []
            },
            { status: 500 }
        )
    }
}
