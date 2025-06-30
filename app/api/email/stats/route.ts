import { NextResponse } from 'next/server'

// Mock email stats - in production this would connect to email service
export async function GET() {
    try {
        // Mock data for email statistics
        const emailStats = {
            totalSent: 15,
            totalReceived: 8,
            totalTemplates: 5,
            pendingEmails: 2,
            recentEmails: [
                {
                    id: '1',
                    from: 'admin@aksstudio.com',
                    to: 'artist@example.com',
                    subject: 'Welcome to AKs Studio',
                    date: new Date().toISOString(),
                    type: 'sent',
                    read: true
                },
                {
                    id: '2',
                    from: 'notification@aksstudio.com',
                    to: 'manager@example.com',
                    subject: 'New submission received',
                    date: new Date(Date.now() - 3600000).toISOString(),
                    type: 'sent',
                    read: true
                }
            ]
        }

        return NextResponse.json({
            success: true,
            data: emailStats
        })
    } catch (error) {
        console.error('Error fetching email stats:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch email statistics'
            },
            { status: 500 }
        )
    }
}
