import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Ghi log ra console của server với cấu trúc rõ ràng
    logger.info("Client Activity", body);
    return NextResponse.json({ success: true, id: new Date().getTime().toString() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to process activity log", { error: errorMessage });
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}