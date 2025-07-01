import { type NextRequest, NextResponse } from "next/server"
import { uploadAudioFile, uploadImageFile } from "@/lib/storage-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null
    const userId = formData.get("userId") as string | null
    const artistName = formData.get("artistName") as string | null
    const songTitle = formData.get("songTitle") as string | null
    const isrc = formData.get("isrc") as string | null

    // Validate required fields
    const missingFields = []
    if (!file) missingFields.push("file")
    if (!type) missingFields.push("type")
    if (!userId) missingFields.push("userId")
    if (!artistName) missingFields.push("artistName")
    if (!songTitle) missingFields.push("songTitle")
    if (!isrc) missingFields.push("isrc")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Log the request details
    console.log("🔍 Upload request:", {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      type,
      userId,
      artistName,
      songTitle,
      isrc,
    })

    // Validate file type
    if (type !== "audio" && type !== "image") {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid file type: '${type}'. Supported types: audio, image`,
        },
        { status: 400 },
      )
    }

    let result
    if (type === "audio") {
      result = await uploadAudioFile(file, userId, artistName, songTitle, isrc)
    } else {
      // type === "image"
      result = await uploadImageFile(file, userId, artistName, songTitle, isrc)
    }

    if (result.success) {
      console.log("✅ Upload successful:", result.url)
      return NextResponse.json({
        success: true,
        url: result.url,
        key: result.key,
        message: "File uploaded successfully",
      })
    } else {
      console.error("❌ Upload failed:", result.error)
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Upload failed for unknown reason",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("🚨 Upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Upload failed: ${error.message || "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
