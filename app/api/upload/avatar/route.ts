import { NextRequest, NextResponse } from "next/server"
import { uploadUserAvatar } from "@/lib/storage-service"
import { simpleUploadAvatar } from "@/lib/simple-upload"
import fs from "fs/promises"
import path from "path"

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Types
interface LogData {
    [key: string]: unknown;
}

interface UploadResult {
    success: boolean;
    message?: string;
    url?: string;
    path?: string;
}

// Format size to human readable
function formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Debug helper - record all requests and errors to a log file
async function logToFile(message: string, type: 'info' | 'error' | 'success' = 'info', data?: LogData) {
    try {
        const timestamp = new Date().toISOString();
        const logDir = path.join(process.cwd(), "logs");
        await fs.mkdir(logDir, { recursive: true });
        const logFile = path.join(logDir, "avatar-upload.log");

        let logMessage = `[${timestamp}] `;

        // Add emoji indicators for log type for better visibility
        switch (type) {
            case 'error':
                logMessage += '❌ ';
                break;
            case 'success':
                logMessage += '✅ ';
                break;
            default:
                logMessage += 'ℹ️ ';
        }

        logMessage += message;

        // If additional data is provided, format it nicely
        if (data) {
            logMessage += '\n' + JSON.stringify(data, null, 2);
        }

        await fs.appendFile(logFile, logMessage + '\n\n'); // Add extra newline for readability
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
}

// Validate file
function validateFile(file: File): void {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size (${formatSize(file.size)}) exceeds maximum allowed size (${formatSize(MAX_FILE_SIZE)})`);
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }
}

export async function POST(request: NextRequest) {
    const startTime = performance.now();
    await logToFile('Avatar upload request received', 'info');

    try {
        // Log request headers for debugging (excluding sensitive data)
        const headers = Object.fromEntries(request.headers.entries());
        const safeHeaders = {
            ...headers,
            cookie: headers.cookie ? '[REDACTED]' : undefined,
            authorization: headers.authorization ? '[REDACTED]' : undefined
        };
        await logToFile('Request headers received', 'info', safeHeaders);

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const artistName = formData.get("artistName") as string | null;
        const userId = formData.get("userId") as string | null;
        const role = formData.get("role") as string | null;

        // Log request parameters (excluding sensitive data)
        await logToFile('Request parameters received', 'info', {
            fileName: file?.name || 'missing',
            fileSize: file ? formatSize(file.size) : 'N/A',
            fileType: file?.type || 'N/A',
            artistName: artistName || 'missing',
            hasUserId: !!userId,
            role: role || 'missing'
        });

        // Validate required fields
        const missingFields = [];
        if (!file) missingFields.push("file");
        if (!artistName) missingFields.push("artistName");
        if (!userId) missingFields.push("userId");

        if (missingFields.length > 0) {
            const message = `Missing required fields: ${missingFields.join(", ")}`;
            await logToFile(message, 'error');
            return NextResponse.json(
                { success: false, message },
                { status: 400 }
            );
        }

        // Validate file size and type
        try {
            validateFile(file);
            await logToFile('File validation passed', 'success', {
                fileName: file.name,
                fileSize: formatSize(file.size),
                fileType: file.type
            });
        } catch (validationError) {
            const message = validationError instanceof Error ? validationError.message : String(validationError);
            await logToFile('File validation failed', 'error', { error: message });
            return NextResponse.json(
                { success: false, message },
                { status: 400 }
            );
        }

        // Convert file to buffer
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await logToFile('File buffer created successfully', 'success', {
                fileName: file.name,
                bufferSize: formatSize(buffer.length)
            });

            // Try simple upload first
            await logToFile('Starting file upload', 'info', { method: 'simple' });
            const result = await simpleUploadAvatar(file, artistName);

            if (result.success) {
                const duration = ((performance.now() - startTime) / 1000).toFixed(2);
                await logToFile('Upload completed successfully', 'success', {
                    path: result.path,
                    url: result.url,
                    duration: `${duration}s`
                });

                return NextResponse.json(result);
            } else {
                throw new Error('Simple upload failed');
            }
        } catch (uploadError) {
            // Log upload error and try alternate method
            await logToFile('Simple upload failed, attempting alternate method', 'error', {
                error: uploadError instanceof Error ? uploadError.message : String(uploadError)
            });

            try {
                // Try alternate upload method
                const result = await uploadUserAvatar(file, artistName);

                if (result.success) {
                    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
                    await logToFile('Alternate upload completed successfully', 'success', {
                        path: result.path,
                        url: result.url,
                        duration: `${duration}s`
                    });

                    return NextResponse.json(result);
                } else {
                    throw new Error('Alternate upload failed');
                }
            } catch (alternateError) {
                await logToFile('All upload attempts failed', 'error', {
                    error: alternateError instanceof Error ? alternateError.message : String(alternateError)
                });

                return NextResponse.json(
                    { success: false, message: 'Failed to upload file after multiple attempts' },
                    { status: 500 }
                );
            }
        }
    } catch (error) {
        // Log any unexpected errors
        await logToFile('Unexpected error occurred', 'error', {
            error: error instanceof Error ? error.message : String(error)
        });

        return NextResponse.json(
            { success: false, message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
