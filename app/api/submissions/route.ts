import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("📋 Database Get submissions for:", username || "all users")

    const result = await multiDB.getSubmissions(username ? { username } : {})

    if (result.success) {
      console.log("✅ Submissions retrieved successfully")
      const response = NextResponse.json({
        success: true,
        data: result.data,
        count: result.data.length,
      })

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return response
    } else {
      const errorResponse = NextResponse.json(
        {
          success: false,
          message: "Failed to retrieve submissions",
        },
        { status: 500 },
      )

      errorResponse.headers.set('Access-Control-Allow-Origin', '*')
      return errorResponse
    }
  } catch (error) {
    console.error("❌ Get submissions error:", error)
    const errorResponse = NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve submissions",
      },
      { status: 500 },
    )

    errorResponse.headers.set('Access-Control-Allow-Origin', '*')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  try {
    const submissionData = await request.json()

    console.log("📤 Multi-DB Create submission:", submissionData.song_title)

    // Add required fields
    const submission = {
      id: `sub-${Date.now()}`,
      ...submissionData,
      status: submissionData.status || "Đã nhận, đang chờ duyệt",
      submission_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    }

    const result = await databaseService.saveSubmission(submission)

    if (result.success) {
      console.log("✅ Submission created successfully")
      return NextResponse.json({
        success: true,
        message: "Submission created successfully",
        id: submission.id,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create submission",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Create submission error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create submission",
      },
      { status: 500 },
    )
  }
}
