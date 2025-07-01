import { NextRequest, NextResponse } from "next/server"
import { uploadUserAvatar } from "@/lib/storage-service"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const artistName = formData.get("artistName") as string | null
        const userId = formData.get("userId") as string | null

        // Validate required fields
        const missingFields = [];
        if (!file) missingFields.push("file");
        if (!artistName) missingFields.push("artistName");
        if (!userId) missingFields.push("userId");

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Missing required fields: ${missingFields.join(", ")}`,
                },
                { status: 400 },
            )
        }

        // Log request details
        console.log("🔍 Avatar upload request:", {
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileType: file.type,
            artistName,
            userId,
        })

        const result = await uploadUserAvatar(file, artistName)

        if (result.success) {
            console.log("✅ Avatar upload successful:", result.url)
            return NextResponse.json({
                success: true,
                url: result.url,
                key: result.key,
                message: "Avatar uploaded successfully",
            })
        } else {
            console.error("❌ Avatar upload failed:", result.error)
            return NextResponse.json(
                {
                    success: false,
                    message: result.error || "Avatar upload failed for unknown reason",
                },
                { status: 500 },
            )
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("🚨 Avatar upload API error:", error)
        return NextResponse.json(
            {
                success: false,
                message: `Avatar upload failed: ${message}`
            },
            { status: 500 }
        )
    }
}
