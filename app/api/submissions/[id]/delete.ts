import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"
import { databaseService } from "@/lib/database-service"

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
