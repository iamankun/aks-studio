import { NextResponse } from "next/server"
import { multiDB } from "@/lib/multi-database-service"

export async function GET() {
  try {
    const status = await multiDB.getStatus()

    let primary: string;
    if (status.neon) {
      primary = "neon";
    } else if (status.wordpress) {
      primary = "wordpress";
    } 

    return NextResponse.json({
      success: true,
      message: "Database status retrieved",
      databases: {
        neon: {
          available: status.neon,
          description: "Neon - Primary Database (User Preferred)",
        },
        wordpress: {
          available: status.wordpress,
          description: "WordPress - Secondary Database",
        },
      },
      primary,
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
