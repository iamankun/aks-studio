// Tôi là An Kun
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateISRC(user: any, counter: number): { isrc: string; newCounter: number } {
  const prefix = "VNA2P"
  const currentYear = new Date().getFullYear().toString().slice(-2)
  const paddedCounter = counter.toString().padStart(5, "0")
  return {
    isrc: `${prefix}${currentYear}${paddedCounter}`,
    newCounter: counter + 1
  }
}

export function validateAudioFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Chỉ chấp nhận file WAV
  if (file.type !== "audio/wav") {
    errors.push("Chỉ chấp nhận file WAV 24-bit, 2 kênh, 192kHz")
  }

  // Check file size (100MB max cho file WAV chất lượng cao)
  if (file.size > 100 * 1024 * 1024) {
    errors.push("File quá lớn (tối đa 100MB)")
  }

  return { valid: errors.length === 0, errors }
}

export function getMinimumReleaseDate(): string {
  const today = new Date()
  today.setDate(today.getDate() + 7) // Minimum 7 days from now
  return today.toISOString().split('T')[0]
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
    case "đã nhận, đang chờ duyệt":
      return "bg-yellow-500"
    case "approved":
    case "đã duyệt, đang chờ phát hành!":
      return "bg-green-500"
    case "rejected":
    case "đã duyệt, từ chối phát hành":
      return "bg-red-500"
    case "processing":
    case "đang xử lý":
      return "bg-blue-500"
    case "published":
    case "đã phát hành, đang chờ ra mắt":
    case "hoàn thành phát hành!":
      return "bg-purple-500"
    case "draft":
      return "bg-gray-500"
    default:
      return "bg-gray-400"
  }
}

// Utility function to sanitize file names
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
}

// Utility function to validate email addresses
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Utility function to validate image files
export async function validateImageFile(file: File): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Kiểm tra định dạng file - chỉ chấp nhận JPG
  if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
    errors.push("Chỉ chấp nhận file ảnh JPG");
  }

  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    errors.push("File quá lớn (tối đa 10MB)");
  }

  return new Promise((resolve) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    const finalResolve = (result: { valid: boolean; errors: string[] }) => {
      URL.revokeObjectURL(imageUrl);
      resolve(result);
    };

    img.onload = () => {
      if (img.width !== 4000 || img.height !== 4000) {
        errors.push("Kích thước phải là 4000x4000px");
      }
      finalResolve({ valid: errors.length === 0, errors });
    };
    img.onerror = () => {
      errors.push("File ảnh không hợp lệ");
      finalResolve({ valid: false, errors });
    };
    img.src = imageUrl;
  });
}

// Utility function to format file sizes
export function formatFileSize(bytes: number, decimalPoint?: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimalPoint || 2
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Utility function to generate unique IDs
export function generateId(prefix: string = 'ID'): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Utility function to truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
