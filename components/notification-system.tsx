"use client"

import React from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

// Định nghĩa kiểu dữ liệu cho một thông báo
export interface NotificationData {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number // Thời gian hiển thị (ms), nếu không có sẽ không tự đóng
  sound?: boolean // Có phát âm thanh không
}

// Props cho NotificationSystem
interface NotificationSystemProps {
  notifications: NotificationData[] | undefined | null
  onRemove: (id: string) => void
}

// Âm thanh cho các loại thông báo
export const playSound = (type: NotificationData["type"]) => {
  if (typeof window === "undefined" || !window.AudioContext) return

  try {
    // Use explicit type to avoid 'any'
    const AudioContextClass = window.AudioContext || ((window as unknown) as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioContext = new AudioContextClass()
    if (!audioContext) return

    const playNote = (frequency: number, startTime: number, duration: number, volume = 0.1, waveType: OscillatorType = "sine") => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = waveType
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime)
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + startTime + duration)

      oscillator.start(audioContext.currentTime + startTime)
      oscillator.stop(audioContext.currentTime + startTime + duration)
    }

    switch (type) {
      case "success":
        playNote(523.25, 0, 0.1, 0.08, "triangle") // C5
        playNote(659.25, 0.07, 0.1, 0.08, "triangle") // E5
        playNote(783.99, 0.14, 0.1, 0.08, "triangle") // G5
        playNote(1046.5, 0.21, 0.15, 0.08, "triangle") // C6
        break
      case "error":
        playNote(220, 0, 0.15, 0.07, "sawtooth") // A3
        playNote(164.81, 0.1, 0.2, 0.07, "sawtooth") // E3
        break
      case "warning":
        playNote(440, 0, 0.1, 0.06, "square") // A4
        playNote(440, 0.15, 0.1, 0.06, "square") // A4
        playNote(440, 0.3, 0.1, 0.06, "square") // A4
        break
      case "info":
        playNote(698.46, 0, 0.1, 0.05, "sine") // F5
        playNote(880.0, 0.08, 0.15, 0.05, "sine") // A5
        break
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

// Component NotificationSystem
export function NotificationSystem({ notifications, onRemove }: Readonly<NotificationSystemProps>) {
  if (!notifications || notifications.length === 0) {
    return null
  }

  // Helper function to get notification styles based on type
  const getNotificationStyles = (type: NotificationData["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-600/90 border-green-500";
      case "info":
        return "bg-blue-600/90 border-blue-500";
      case "warning":
        return "bg-yellow-600/90 border-yellow-500";
      case "error":
      default:
        return "bg-red-600/90 border-red-500";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg backdrop-blur-md border ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white">{notification.title}</h4>
              <p className="text-sm text-gray-100">{notification.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(notification.id)}
              className="p-1 h-auto text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Tôi là An Kun
export default NotificationSystem
