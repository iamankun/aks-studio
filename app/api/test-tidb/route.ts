import { NextResponse } from "next/server"
import { testTiDBConnection, createTablesIfNotExists, queryTiDB } from "@/lib/tidb-client"

export async function GET() {
  try {
    console.log("🧪 Testing TiDB Cloud connection...")

    // Test basic connection
    const connectionTest = await testTiDBConnection()
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: "TiDB Cloud connection failed",
        error: connectionTest.message,
        ip: "42.119.149.253",
      })
    }

    // Create tables if they don't exist
    const tablesResult = await createTablesIfNotExists()
    if (!tablesResult.success) {
      return NextResponse.json({
        success: false,
        message: "Table creation failed",
        error: tablesResult.message,
        ip: "42.119.149.253",
      })
    }

    // Test a simple query
    const queryResult = await queryTiDB("SELECT COUNT(*) as user_count FROM users")

    return NextResponse.json({
      success: true,
      message: "TiDB Cloud connection successful!",
      ip: "42.119.149.253",
      connectionTest,
      tablesResult,
      userCount: queryResult.success ? queryResult.data : "Unknown",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ TiDB test route error:", error)
    return NextResponse.json({
      success: false,
      message: "TiDB test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      ip: "42.119.149.253",
    })
  }
}

export async function POST() {
  try {
    // Test creating a sample submission
    const testSubmission = {
      id: `test-${Date.now()}`,
      uploader_username: "admin",
      artist_name: "Test Artist",
      song_title: "Test Song",
      isrc: "TEST123456789",
      status: "Đã nhận, đang chờ duyệt",
      submission_date: new Date().toISOString().split("T")[0],
      release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }

    const result = await queryTiDB(
      `INSERT INTO submissions (id, uploader_username, artist_name, song_title, isrc, status, submission_date, release_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testSubmission.id,
        testSubmission.uploader_username,
        testSubmission.artist_name,
        testSubmission.song_title,
        testSubmission.isrc,
        testSubmission.status,
        testSubmission.submission_date,
        testSubmission.release_date,
      ],
    )

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test submission created successfully" : "Failed to create test submission",
      testSubmission,
      result,
      ip: "42.119.149.253",
    })
  } catch (error) {
    console.error("❌ TiDB POST test error:", error)
    return NextResponse.json({
      success: false,
      message: "TiDB POST test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      ip: "42.119.149.253",
    })
  }
}
