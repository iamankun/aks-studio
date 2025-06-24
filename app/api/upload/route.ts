import { type NextRequest, NextResponse } from "next/server"
import { uploadAudioFile, uploadImageFile } from "@/lib/storage-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const userId = formData.get("userId") as string

    if (!file || !type || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: file, type, userId",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Upload request:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      type,
      userId,
    })

    let result

    if (type === "audio") {
      result = await uploadAudioFile(file, userId)
    } else if (type === "image") {
      result = await uploadImageFile(file, userId)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Supported: audio, image",
        },
        { status: 400 },
      )
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
          message: result.error || "Upload failed",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("🚨 Upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Upload failed: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
