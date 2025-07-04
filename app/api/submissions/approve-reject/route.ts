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

// POST /api/submissions/approve-reject - Approve hoặc reject submission
export async function POST(request: NextRequest) {
    try {
        const { submissionId, action } = await request.json()

        if (!submissionId || !action) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Submission ID and action are required",
                },
                { status: 400 },
            )
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Action must be 'approve' or 'reject'",
                },
                { status: 400 },
            )
        }

        console.log(`📋 ${action} submission:`, submissionId)

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

        // Kiểm tra quyền approve/reject
        const canApproveReject = AuthorizationService.canApproveRejectSubmission(currentUser)

        if (!canApproveReject.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: canApproveReject.reason || "Permission denied",
                },
                { status: 403 },
            )
        }

        // Lấy submission hiện tại
        const existingResult = await multiDB.getSubmissionById(submissionId)

        if (!existingResult.success || !existingResult.data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Submission not found",
                },
                { status: 404 },
            )
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateData = {
            status: action === 'approve' ? 'approved' : 'rejected'
        }

        // Note: rejection_reason column doesn't exist in current database schema
        // Comment/reason will be handled separately if needed

        // Cập nhật submission
        const result = await multiDB.updateSubmission(submissionId, updateData)

        if (result.success) {
            console.log(`✅ Submission ${action}d successfully`)
            return NextResponse.json({
                success: true,
                message: `Submission ${action}d successfully`,
                id: submissionId,
                action,
                status: updateData.status
            })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: `Failed to ${action} submission`,
                },
                { status: 500 },
            )
        }
    } catch (error) {
        console.error(`❌ ${error}`)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to process request",
            },
            { status: 500 },
        )
    }
}

// OPTIONS method cho CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
