import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/database-service"
import { multiDB } from "@/lib/multi-database-service"

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const submissionId = params.id
        const updateData = await request.json()

        console.log(`📝 Updating submission ${submissionId}`)

        // Validate required fields
        if (!submissionId || Object.keys(updateData).length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing required fields",
                },
                { status: 400 }
            )
        }

        // First try to update using multiDB (primary database)
        const multiDBResult = await multiDB.updateSubmission(submissionId, updateData)

        if (multiDBResult.success) {
            return NextResponse.json({
                success: true,
                message: "Submission updated successfully in primary database",
                data: multiDBResult.submission
            })
        }

        // If multiDB fails, fall back to databaseService
        console.log("Primary database update failed, trying fallback...")
        const result = await databaseService.updateSubmission(submissionId, updateData)

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: "Submission updated successfully in fallback database",
                data: result.data
            })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: result.error || multiDBResult.error || "Failed to update submission",
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("❌ Update submission error:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update submission due to server error",
            },
            { status: 500 }
        )
    }
}

// Get a specific submission by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const submissionId = params.id

        console.log(`📋 Getting submission ${submissionId}`)

        // First try multiDB (primary database)
        const multiDBResult = await multiDB.getSubmissionById(submissionId)

        if (multiDBResult?.success && multiDBResult.data) {
            return NextResponse.json({
                success: true,
                data: multiDBResult.data
            })
        }

        // If multiDB fails, try databaseService
        console.log("Primary database query failed, trying fallback...")
        const allSubmissions = await databaseService.getSubmissions()

        if (allSubmissions.success) {
            const submission = allSubmissions.data?.find(s => s.id === submissionId)

            if (submission) {
                return NextResponse.json({
                    success: true,
                    data: submission
                })
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Submission not found",
                    },
                    { status: 404 }
                )
            }
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to retrieve submission",
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("❌ Get submission error:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to retrieve submission due to server error",
            },
            { status: 500 }
        )
    }
}

// Delete a submission
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const submissionId = params.id

        console.log(`🗑️ Deleting submission ${submissionId}`)

        // Validate required field
        if (!submissionId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Missing submission ID",
                },
                { status: 400 }
            )
        }

        // First try multiDB (primary database)
        const multiDBResult = await multiDB.deleteSubmission(submissionId)

        if (multiDBResult?.success) {
            return NextResponse.json({
                success: true,
                message: "Submission deleted successfully from primary database"
            })
        }

        // If multiDB fails or isn't implemented, try databaseService
        console.log("Primary database delete failed or not implemented, trying fallback...")
        const dbResult = await databaseService.deleteSubmission(submissionId)

        if (dbResult.success) {
            return NextResponse.json({
                success: true,
                message: "Submission deleted successfully from fallback database"
            })
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: dbResult.error || multiDBResult?.error || "Failed to delete submission",
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("❌ Delete submission error:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete submission due to server error",
            },
            { status: 500 }
        )
    }
}
