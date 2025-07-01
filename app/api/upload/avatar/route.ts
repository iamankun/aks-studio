import { NextRequest, NextResponse } from "next/server"
import { uploadUserAvatar } from "@/lib/storage-service"
import { simpleUploadAvatar } from "@/lib/simple-upload"
import { uploadAvatarToDatabase } from "@/lib/database-upload"
import fs from "fs/promises"
import path from "path"

// Debug helper - record all requests and errors to a log file
async function logToFile(message: string) {
    try {
        const logDir = path.join(process.cwd(), "logs");
        await fs.mkdir(logDir, { recursive: true });
        const logFile = path.join(logDir, "avatar-upload.log");
        await fs.appendFile(logFile, `${new Date().toISOString()}: ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

export async function POST(request: NextRequest) {
    await logToFile("API called: POST /api/upload/avatar");
    try {
        // Log request headers for debugging
        const headers = Object.fromEntries(request.headers.entries());
        await logToFile(`Request headers: ${JSON.stringify(headers)}`);

        const formData = await request.formData()
        const file = formData.get("file") as File | null
        const artistName = formData.get("artistName") as string | null
        const userId = formData.get("userId") as string | null
        const role = formData.get("role") as string | null

        await logToFile(`Request params - File: ${file?.name || 'missing'}, ArtistName: ${artistName || 'missing'}, UserID: ${userId || 'missing'}, Role: ${role || 'missing'}`);

        // Validate required fields
        const missingFields = [];
        if (!file) missingFields.push("file");
        if (!artistName) missingFields.push("artistName");
        if (!userId) missingFields.push("userId");

        if (missingFields.length > 0) {
            const message = `Missing required fields: ${missingFields.join(", ")}`;
            await logToFile(`Error: ${message}`);
            return NextResponse.json(
                {
                    success: false,
                    message: message,
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

        await logToFile(`Processing file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB, type: ${file.type}`);

        try {
            // Verify file content is usable
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await logToFile(`File converted to buffer successfully: ${buffer.length} bytes`);

            // Thử phương pháp upload đơn giản trước
            await logToFile("Using simple upload method");
            const result = await simpleUploadAvatar(file, artistName);

            // Nếu simple upload thất bại, thử phương pháp gốc
            if (!result.success) {
                await logToFile("Simple upload failed, trying original method");
                const originalResult = await uploadUserAvatar(file, artistName);
                if (originalResult.success) {
                    await logToFile("Original upload method succeeded");
                    return NextResponse.json({
                        success: true,
                        url: originalResult.url,
                        key: originalResult.key,
                        message: "Avatar uploaded successfully using original method",
                    });
                }

                // Nếu cả hai phương pháp đều thất bại, thử lưu vào PostgreSQL
                await logToFile("Both methods failed, trying database storage");
                const role = formData.get("role") as string || "Artist"; // Mặc định là Artist nếu không có
                const dbResult = await uploadAvatarToDatabase(file, userId, role);
                if (dbResult.success) {
                    await logToFile("Database upload succeeded");
                    return NextResponse.json({
                        success: true,
                        url: dbResult.url,
                        key: dbResult.key,
                        message: "Avatar uploaded successfully to database",
                    });
                } else {
                    await logToFile(`Database upload failed: ${dbResult.error}`);
                }
            }

            if (result.success) {
                console.log("✅ Avatar upload successful:", result.url)
                await logToFile(`Upload success: ${result.url}`);
                return NextResponse.json({
                    success: true,
                    url: result.url,
                    key: result.key,
                    message: "Avatar uploaded successfully",
                })
            } else {
                console.error("❌ Avatar upload failed:", result.error)
                await logToFile(`Upload failed: ${result.error}`);
                return NextResponse.json(
                    {
                        success: false,
                        message: result.error || "Avatar upload failed for unknown reason",
                    },
                    { status: 500 },
                )
            }
        } catch (uploadError) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
            await logToFile(`Error during upload process: ${errorMessage}`);
            console.error("Error processing upload:", uploadError);
            return NextResponse.json(
                {
                    success: false,
                    message: `Error processing upload: ${errorMessage}`
                },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error"
        console.error("🚨 Avatar upload API error:", error)
        await logToFile(`Critical API error: ${message}`);
        return NextResponse.json(
            {
                success: false,
                message: `Avatar upload failed: ${message}`
            },
            { status: 500 }
        )
    }
}
