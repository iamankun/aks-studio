import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Mock system logs - in production this would read from actual log files
        const systemLogs = [
            {
                id: '1',
                timestamp: new Date().toISOString(),
                level: 'INFO',
                component: 'Dashboard',
                message: 'User accessed dashboard',
                userId: 'ankun'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                level: 'SUCCESS',
                component: 'Authentication',
                message: 'User login successful',
                userId: 'testartist'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                level: 'INFO',
                component: 'Database',
                message: 'Database connection established',
                userId: 'system'
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 900000).toISOString(),
                level: 'WARNING',
                component: 'API',
                message: 'Rate limit approaching for user',
                userId: 'testartist'
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 1200000).toISOString(),
                level: 'ERROR',
                component: 'Upload',
                message: 'File upload failed - invalid format',
                userId: 'unknownuser'
            }
        ]

        return NextResponse.json({
            success: true,
            logs: systemLogs,
            totalLogs: systemLogs.length
        })
    } catch (error) {
        console.error('Error fetching system logs:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch system logs'
            },
            { status: 500 }
        )
    }
}
