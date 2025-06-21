"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Disc3, Music, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessAnimationProps {
  artistName: string
  songTitle: string
  onClose: () => void
}

export function SuccessAnimation({ artistName, songTitle, onClose }: SuccessAnimationProps) {
  const [stage, setStage] = useState<"disc" | "digital" | "complete">("disc")

  useEffect(() => {
    // First stage: spinning disc with notes
    setTimeout(() => {
      setStage("digital")
    }, 2000)

    // Second stage: digital transformation effect
    setTimeout(() => {
      setStage("complete")
    }, 4000)
  }, [])

  const createMusicNotes = () => {
    const notes = []
    for (let i = 0; i < 8; i++) {
      const noteSymbols = ["♪", "♫", "♬", "♩", "♭", "♯"]
      const randomNote = noteSymbols[Math.floor(Math.random() * noteSymbols.length)]
      const direction = Math.random() > 0.5 ? 1 : -1
      const rotation = Math.random() > 0.5 ? 1 : -1

      notes.push(
        <div
          key={i}
          className="album-notes text-4xl text-purple-300"
          style={
            {
              left: `${45 + Math.random() * 10}%`,
              top: `${40 + Math.random() * 10}%`,
              "--direction": direction,
              "--rotation": rotation,
              animationDelay: `${i * 0.2}s`,
            } as React.CSSProperties
          }
        >
          {randomNote}
        </div>,
      )
    }
    return notes
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 rounded-full"
        size="icon"
      >
        <X className="h-5 w-5" />
      </Button>

      {stage === "disc" && (
        <div className="text-center">
          {createMusicNotes()}
          <div className="album-disc spinning relative mx-auto mb-6 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{songTitle}</h3>
          <p className="text-lg text-gray-300">by {artistName}</p>
        </div>
      )}

      {stage === "digital" && (
        <div className="digital-transform text-center">
          <div className="relative mx-auto mb-6 w-40 h-40">
            <Disc3 className="h-40 w-40 text-purple-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs text-white opacity-70">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="leading-3">
                    {Math.random().toString(2).substring(2, 10)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{songTitle}</h3>
          <p className="text-lg text-gray-300">by {artistName}</p>
        </div>
      )}

      {stage === "complete" && (
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-8">
            <Music className="h-16 w-16 text-green-500 animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gradient-purple mb-4">
            Cảm ơn {artistName} đã đồng hành cùng Giai Điệu Gen Z!
          </h2>
          <p className="text-xl text-gray-300 mb-3">
            Bản phát hành <span className="text-gradient-blue">{songTitle}</span> đã gửi đi!
          </p>
          <p className="text-lg text-green-400 animate-pulse">Đang chờ kiểm duyệt...</p>

          <Button
            onClick={onClose}
            className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full px-6"
          >
            Đóng
          </Button>
        </div>
      )}
    </div>
  )
}
