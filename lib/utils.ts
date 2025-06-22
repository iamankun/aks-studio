// Tôi là An Kun
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/types/user"
import { format, addDays } from "date-fns"

export function cn(...inputs: ClassValue[]) { // This function was already exported
  return twMerge(clsx(inputs))
}

export function generateISRC(user: User, lastCounter: number): { isrc: string; newCounter: number } {
  // Tôi là An Kun
  const newCounter = lastCounter + 1
  const paddedCounter = newCounter.toString().padStart(5, "0")
  // Sử dụng prefix từ user.isrcCodeprefix nếu có
  const prefix = user.isrcCodePrefix || "VNA2P"
  const isrc = `${prefix}${new Date().getFullYear()}${paddedCounter}`
  return { isrc, newCounter }
}

export function getStatusColor(status: string): string { // This function was already exported
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500"
    case "approved":
      return "bg-green-500"
    case "rejected":
      return "bg-red-500"
    case "processing":
      return "bg-blue-500"
    case "published":
      return "bg-purple-500"
    case "draft":
      return "bg-gray-500"
    default:
      return "bg-gray-400"
  }
}

export function getMinimumReleaseDate(): string {
  const today = new Date();
  // Add 2 days for review process, ensuring immutability by creating a new date object.
  const minimumDate = addDays(today, 2);
  return format(minimumDate, "yyyy-MM-dd");
}

export async function validateImageFile(file: File): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  // Check file type
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    errors.push("Chỉ chấp nhận file JPG/JPEG")
  }

  // Check file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    errors.push("File quá lớn (tối đa 5MB)")
  }

  // Check dimensions by loading the image
  return new Promise((resolve) => {
    const imageUrl = URL.createObjectURL(file)
    const img = new Image()

    const finalResolve = (result: { valid: boolean; errors: string[] }) => {
      URL.revokeObjectURL(imageUrl) // Revoke to prevent memory leaks
      resolve(result)
    }

    img.onload = () => {
      if (img.width !== 4000 || img.height !== 4000) {
        errors.push("Kích thước phải là 4000x4000px")
      }
      finalResolve({ valid: errors.length === 0, errors })
    }
    img.onerror = () => {
      errors.push("File ảnh không hợp lệ")
      finalResolve({ valid: false, errors })
    }
    img.src = imageUrl
  })
}

export async function validateAudioFile(file: File): Promise<{ valid: boolean; errors: string[] }> { // This function was already exported
  const errors: string[] = []

  // Check file type
  if (!file.type.includes("wav") && !file.name.toLowerCase().endsWith(".wav")) {
    errors.push("Chỉ chấp nhận file WAV")
  }

  // Check file size (100MB max for audio)
  if (file.size > 100 * 1024 * 1024) {
    errors.push("File audio quá lớn (tối đa 100MB)")
  }

  return { valid: errors.length === 0, errors }
}

// Add export to formatFileSize function
export function formatFileSize(bytes: number, decimalPoint?: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024; // Or 1000 for SI units
  const dm = decimalPoint || 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
