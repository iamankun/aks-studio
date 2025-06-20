// Tôi là An Kun
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from "@/types/user"
import { neon } from '@neondatabase/serverless'
import { format } from "date-fns"
import { createClient } from '@supabase/supabase-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateISRC(user: User, lastCounter: number): { isrc: string; newCounter: number } {
  // Tôi là An Kun
  const newCounter = lastCounter + 1
  const paddedCounter = newCounter.toString().padStart(5, "0")
  // Sử dụng prefix từ user.isrc_code_prefix nếu có
  const prefix = user.isrc_code_prefix || "VNA2P"
  const isrc = `${prefix}${new Date().getFullYear()}${paddedCounter}`
  return { isrc, newCounter }
}

export function getStatusColor(status: string): string {
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
  const today = new Date()
  // Add 2 days for review process
  today.setDate(today.getDate() + 2)
  return today.toISOString().split("T")[0]
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

  // Check dimensions (would need to load image to check, simplified for now)
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      if (img.width !== 4000 || img.height !== 4000) {
        errors.push("Kích thước phải là 4000x4000px")
      }
      resolve({ valid: errors.length === 0, errors })
    }
    img.onerror = () => {
      errors.push("File ảnh không hợp lệ")
      resolve({ valid: false, errors })
    }
    img.src = URL.createObjectURL(file)
  })
}

export async function validateAudioFile(file: File): Promise<{ valid: boolean; errors: string[] }> {
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
