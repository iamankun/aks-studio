import { type NextRequest, NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("📋 Multi-DB Get submissions for:", username || "all users")

    const result = await multiDB.getSubmission(username || undefined)

    if (result.success) {
      console.log("✅ Submissions retrieved via:", result.source)
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        count: result.data.length,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to retrieve submissions",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Get submissions error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve submissions",
      },
      { status: 500 },
    )
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

    const result = await multiDB.createSubmission(submission)

    if (result.success) {
      console.log("✅ Submission created via:", result.source)
      return NextResponse.json({
        success: true,
        message: "Submission created successfully",
        source: result.source,
        id: submission.id,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to create submission",
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
