"use client"

import { useEffect } from "react"

export function SoundSystem() {
  useEffect(() => {
    const playSound = (type: "success" | "error") => {
      // Simple sound feedback
      const context = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      oscillator.frequency.value = type === "success" ? 800 : 400
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5)

      oscillator.start(context.currentTime)
      oscillator.stop(context.currentTime + 0.5)
    }

    const handleGlobalNotification = (event: CustomEvent) => {
      const { type } = event.detail
      playSound(type)
    }

    window.addEventListener("showGlobalNotification", handleGlobalNotification as EventListener)

    return () => {
      window.removeEventListener("showGlobalNotification", handleGlobalNotification as EventListener)
    }
  }, [])

  return null
}
