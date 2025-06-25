import { NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

export async function GET() {
  try {
    const status = multiDB.getStatus()

    return NextResponse.json({
      success: true,
      message: "Database status retrieved",
      databases: {
        tidb: {
          available: status.tidb,
          ip: "42.119.149.253",
          description: "TiDB Cloud - Primary Database",
        },
        supabase: {
          available: status.supabase,
          description: "Supabase - Secondary Database",
        },
        neon: {
          available: status.neon,
          description: "Neon - Tertiary Database",
        },
      },
      primary: status.primary,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Database status error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get database status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
