import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, STORAGE_BUCKETS, getStorageUrl, getS3Key } from "./supabase-config"

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

// Upload file to S3 storage
export async function uploadFileToStorage(
  file: File,
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
): Promise<UploadResult> {
  try {
    console.log("🔍 Uploading file:", { fileName: file.name, bucket, path })

    const bucketName = STORAGE_BUCKETS[bucket]
    const key = getS3Key(bucketName, path)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    })

    await s3Client.send(command)

    const url = getStorageUrl(bucketName, path)

    console.log("✅ File uploaded successfully:", { url, key })

    return {
      success: true,
      url,
      key,
    }
  } catch (error) {
    console.error("🚨 Upload error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

// Delete file from storage
export async function deleteFileFromStorage(bucket: keyof typeof STORAGE_BUCKETS, path: string): Promise<boolean> {
  try {
    const bucketName = STORAGE_BUCKETS[bucket]

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: path,
    })

    await s3Client.send(command)

    console.log("✅ File deleted successfully:", { bucket: bucketName, path })
    return true
  } catch (error) {
    console.error("🚨 Delete error:", error)
    return false
  }
}

// Generate unique file path
export function generateFilePath(userId: string, fileName: string, type: "audio" | "image" | "document"): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = fileName.split(".").pop()
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")

  return `${type}/${userId}/${timestamp}_${randomId}_${sanitizedName}`
}

// Upload audio file
export async function uploadAudioFile(file: File, userId: string): Promise<UploadResult> {
  const path = generateFilePath(userId, file.name, "audio")
  return uploadFileToStorage(file, "audio", path)
}

// Upload image file
export async function uploadImageFile(file: File, userId: string): Promise<UploadResult> {
  const path = generateFilePath(userId, file.name, "image")
  return uploadFileToStorage(file, "images", path)
}

// Upload document file
export async function uploadDocumentFile(file: File, userId: string): Promise<UploadResult> {
  const path = generateFilePath(userId, file.name, "document")
  return uploadFileToStorage(file, "documents", path)
}
