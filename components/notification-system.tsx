"use client"

import { useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export interface NotificationData {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
  sound?: boolean
}

interface NotificationSystemProps {
  notifications?: NotificationData[]
  onRemove: (id: string) => void
}

export function NotificationSystem({ notifications = [], onRemove }: NotificationSystemProps) {
  const playNotificationSound = (type: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      const soundPatterns = {
        success: () => {
          // Happy ascending chord
          const frequencies = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5
          frequencies.forEach((freq, index) => {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)

              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
              oscillator.type = "sine"

              gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.4)
            }, index * 100)
          })
        },
        error: () => {
          // Descending warning sound
          const frequencies = [440, 370, 311, 262] // A4 down to C4
          frequencies.forEach((freq, index) => {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)

              oscillator.frequency.setValueAtTime(freq, audioContext.currentTime)
              oscillator.type = "sawtooth"

              gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.3)
            }, index * 150)
          })
        },
        info: () => {
          // Gentle notification bell
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5)
          oscillator.type = "triangle"

          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.5)
        },
        warning: () => {
          // Urgent beeping pattern
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)

              oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
              oscillator.type = "square"

              gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.1)
            }, i * 200)
          }
        },
      }

      const soundFunction = soundPatterns[type as keyof typeof soundPatterns] || soundPatterns.info
      soundFunction()
    } catch (error) {
      console.log("Audio not supported or blocked")
    }
  }

  useEffect(() => {
    if (!notifications || !Array.isArray(notifications)) {
      return
    }

    notifications.forEach((notification) => {
      if (notification.sound) {
        playNotificationSound(notification.type)
      }

      if (notification.duration) {
        setTimeout(() => {
          onRemove(notification.id)
        }, notification.duration)
      }
    })
  }, [notifications, onRemove])

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />
      case "error":
        return <AlertCircle className="h-5 w-5" />
      case "warning":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-600 border-green-500 text-green-100"
      case "error":
        return "bg-red-600 border-red-500 text-red-100"
      case "warning":
        return "bg-yellow-600 border-yellow-500 text-yellow-100"
      default:
        return "bg-blue-600 border-blue-500 text-blue-100"
    }
  }

  // Return null if no notifications or notifications is not an array
  if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 ease-in-out font-dosis ${getColors(notification.type)}`}
          style={{ animation: "slideInRight 0.3s ease-out" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {getIcon(notification.type)}
              <div className="flex-1">
                <h4 className="font-dosis-semibold text-sm">{notification.title}</h4>
                <p className="text-sm opacity-90 mt-1 font-dosis">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
