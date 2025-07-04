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

// POST /api/submissions/resubmit - Resubmit sau khi bị reject
export async function POST(request: NextRequest) {
    try {
        const { submissionId, updateData } = await request.json()

        if (!submissionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Submission ID is required",
                },
                { status: 400 },
            )
        }

        console.log("🔄 Resubmit submission:", submissionId)

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

        const existingSubmission = existingResult.data

        // Kiểm tra quyền resubmit
        const canResubmit = AuthorizationService.canResubmitAfterRejection(currentUser, existingSubmission)

        if (!canResubmit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    message: canResubmit.reason || "Cannot resubmit this submission",
                },
                { status: 403 },
            )
        }

        // Chuẩn bị dữ liệu cập nhật cho resubmit
        const resubmitData = {
            ...updateData,
            status: 'pending', // Reset về pending
            rejection_reason: null, // Clear rejection reason
            comment: null, // Clear comment
            updated_at: new Date().toISOString(),
            resubmitted_at: new Date().toISOString()
        }

        // Validate release date nếu có thay đổi
        if (resubmitData.release_date && resubmitData.release_date !== existingSubmission.release_date) {
            const dateValidation = AuthorizationService.validateReleaseDate(
                currentUser,
                existingSubmission,
                resubmitData.release_date
            )

            if (!dateValidation.allowed) {
                return NextResponse.json(
                    {
                        success: false,
                        message: dateValidation.reason || "Invalid release date",
                    },
                    { status: 400 },
                )
            }
        }

        // Resubmit submission
        const result = await multiDB.updateSubmission(submissionId, resubmitData)

        if (result.success) {
            console.log("✅ Submission resubmitted successfully")
            return NextResponse.json({
                success: true,
                message: "Submission resubmitted successfully",
                id: submissionId,
                status: "pending"
            })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to resubmit submission",
                },
                { status: 500 },
            )
        }
    } catch (error) {
        console.error("❌ Resubmit submission error:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to resubmit submission",
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
