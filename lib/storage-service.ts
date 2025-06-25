// Dummy storage service - not using file upload anymore
export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadAudioFile(file: File, userId: string): Promise<UploadResult> {
  return {
    success: false,
    error: "File upload not implemented - using TiDB only",
  }
}

export async function uploadImageFile(file: File, userId: string): Promise<UploadResult> {
  return {
    success: false,
    error: "File upload not implemented - using TiDB only",
  }
}
