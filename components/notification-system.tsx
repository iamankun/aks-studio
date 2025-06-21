// Tôi là An Kun
import React, { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

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
const playSound = (type: NotificationData["type"]) => {
  if (typeof window === "undefined" || !window.AudioContext) return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
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
}

// Component NotificationSystem
export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 w-full max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Component NotificationItem (mỗi thông báo riêng lẻ)
const NotificationItem: React.FC<{ notification: NotificationData; onRemove: (id: string) => void }> = ({
  notification,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (notification.sound) {
      playSound(notification.type)
    }

    if (notification.duration) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleClose = () => {
    setIsVisible(false)
    // Đợi animation hoàn thành rồi mới remove
    setTimeout(() => {
      onRemove(notification.id)
    }, 300) // Thời gian animation
  }

  const baseClasses = "relative w-full p-4 border rounded-lg shadow-xl transition-all duration-300 ease-in-out"
  const typeClasses = {
    success: "bg-green-600 border-green-500 text-green-100",
    error: "bg-red-600 border-red-500 text-red-100",
    info: "bg-blue-600 border-blue-500 text-blue-100",
    warning: "bg-yellow-600 border-yellow-500 text-yellow-100",
  }
  const animationClasses = isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle, // Có thể dùng AlertTriangle nếu muốn khác biệt
  }[notification.type]

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]} ${animationClasses} font-sans`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-bold">{notification.title}</p>
          <p className="mt-1 text-sm font-medium">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="inline-flex rounded-md text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-current focus:ring-white"
          >
            <span className="sr-only">Đóng</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Tôi là An Kun
export default NotificationSystem
