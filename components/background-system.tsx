"use client"

import type React from "react"

import { useEffect, useState } from "react"

const DEFAULT_VIDEOS = [
  "dQw4w9WgXcQ", // Rick Astley - Never Gonna Give You Up
  "kJQP7kiw5Fk", // Despacito
  "fJ9rUzIMcZQ", // Bohemian Rhapsody
  "9bZkp7q19f0", // Gangnam Style
  "hTWKbfoikeg", // Smells Like Teen Spirit
  "YQHsXMglC9A", // Hello - Adele
  "CevxZvSJLk8", // Katy Perry - Roar
  "JGwWNGJdvx8", // Shape of You
  "RgKAFK5djSk", // Wiz Khalifa - See You Again
  "OPf0YbXqDm0", // Mark Ronson - Uptown Funk
]

export function BackgroundSystem() {
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: "gradient",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    videoUrl: "",
    imageUrl: "", // Thêm thuộc tính imageUrl
    opacity: 0.3,
    randomVideo: true,
    videoList: DEFAULT_VIDEOS,
  })

  const [currentVideo, setCurrentVideo] = useState("")
  const [showCustomPanel, setShowCustomPanel] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [imageLink, setImageLink] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [textStyleDialogOpen, setTextStyleDialogOpen] = useState(false)
  const [currentTextInput, setCurrentTextInput] = useState<"title" | "subtitle" | null>(null)
  const [titleStyle, setTitleStyle] = useState<{
    gradient: string
    animation: string
    font: string
  }>({ gradient: "", animation: "", font: "" })
  const [subtitleStyle, setSubtitleStyle] = useState<{
    gradient: string
    animation: string
    font: string
  }>({ gradient: "", animation: "", font: "" })

  useEffect(() => {
    // Load background settings
    const saved = localStorage.getItem("backgroundSettings_v2")
    if (saved) {
      const settings = JSON.parse(saved)
      setBackgroundSettings(settings)
    }

    // Listen for background updates
    const handleBackgroundUpdate = (event: CustomEvent) => {
      setBackgroundSettings(event.detail)
    }

    window.addEventListener("backgroundUpdate", handleBackgroundUpdate as EventListener)
    return () => {
      window.removeEventListener("backgroundUpdate", handleBackgroundUpdate as EventListener)
    }
  }, [])

  useEffect(() => {
    if (backgroundSettings.type === "video" && backgroundSettings.randomVideo) {
      const randomIndex = Math.floor(Math.random() * backgroundSettings.videoList.length)
      setCurrentVideo(backgroundSettings.videoList[randomIndex])
    } else if (backgroundSettings.type === "video" && backgroundSettings.videoUrl) {
      const videoId = extractYoutubeId(backgroundSettings.videoUrl)
      setCurrentVideo(videoId || "")
    }
  }, [backgroundSettings])

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[7].length === 11 ? match[7] : null
  }

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setYoutubeUrl(url)

    // Extract YouTube video ID and create thumbnail URL
    const videoId = extractYoutubeId(url)
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      // Dispatch custom event to update background
      window.dispatchEvent(
        new CustomEvent("backgroundUpdate", {
          detail: {
            ...backgroundSettings,
            type: "image",
            imageUrl: thumbnailUrl,
          },
        }),
      )
    }
  }

  const handleImageLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageLink(url)

    // Dispatch custom event to update background
    window.dispatchEvent(
      new CustomEvent("backgroundUpdate", {
        detail: {
          ...backgroundSettings,
          type: "image",
          imageUrl: url,
        },
      }),
    )
  }

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setVideoFile(null)
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      alert("File video không được vượt quá 100MB")
      e.target.value = ""
      setVideoFile(null)
      return
    }

    setVideoFile(file)

    // Create object URL for video preview
    const videoUrl = URL.createObjectURL(file)

    // Dispatch custom event to update background
    window.dispatchEvent(
      new CustomEvent("backgroundUpdate", {
        detail:
        {
          ...backgroundSettings,
          type: "video",
          videoUrl: videoUrl,
        },
      }),
    )

    alert("Video đã được tải lên và sẽ được xử lý sau")
  }

  const openStyleDialog = (inputType: "title" | "subtitle") => {
    setCurrentTextInput(inputType)
    setTextStyleDialogOpen(true)
  }

  const applyTextStyle = (style: { gradient: string; animation: string; font: string }) => {
    if (currentTextInput === "title") {
      setTitleStyle(style)
      // Apply to title elements
      const titleElements = document.querySelectorAll(".custom-title")
      titleElements.forEach((el) => {
        el.className = `custom-title ${style.gradient} ${style.animation} ${style.font}`
      })
    } else if (currentTextInput === "subtitle") {
      setSubtitleStyle(style)
      // Apply to subtitle elements
      const subtitleElements = document.querySelectorAll(".custom-subtitle")
      subtitleElements.forEach((el) => {
        el.className = `custom-subtitle ${style.gradient} ${style.animation} ${style.font}`
      })
    }
    setTextStyleDialogOpen(false)
    setCurrentTextInput(null)
  }

  const TextStyleDialog = () => {
    if (!textStyleDialogOpen) return null

    const gradientOptions = [
      { name: "Purple", class: "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" },
      { name: "Blue", class: "bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" },
      { name: "Green", class: "bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent" },
      { name: "Gold", class: "bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent" },
    ]

    const animationOptions = [
      { name: "None", class: "" },
      { name: "Pulse", class: "animate-pulse" },
      { name: "Bounce", class: "animate-bounce" },
      { name: "Ping", class: "animate-ping" },
    ]

    const fontOptions = [
      { name: "Normal", class: "font-dosis" },
      { name: "Light", class: "font-dosis-light" },
      { name: "Medium", class: "font-dosis-medium" },
      { name: "Bold", class: "font-dosis-bold" },
      { name: "Extra Bold", class: "font-dosis-extrabold" },
    ]

    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Tùy chỉnh {currentTextInput === "title" ? "Tiêu đề" : "Phụ đề"}
            </h3>
            <button onClick={() => setTextStyleDialogOpen(false)} className="text-gray-400 hover:text-white">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Gradient màu:</label>
              <div className="grid grid-cols-2 gap-2">
                {gradientOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() =>
                      applyTextStyle({
                        gradient: option.class,
                        animation: currentTextInput === "title" ? titleStyle.animation : subtitleStyle.animation,
                        font: currentTextInput === "title" ? titleStyle.font : subtitleStyle.font,
                      })
                    }
                    className="p-2 border border-gray-600 rounded text-xs hover:bg-gray-700"
                  >
                    <span className={option.class}>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Animation:</label>
              <div className="grid grid-cols-2 gap-2">
                {animationOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() =>
                      applyTextStyle({
                        gradient: currentTextInput === "title" ? titleStyle.gradient : subtitleStyle.gradient,
                        animation: option.class,
                        font: currentTextInput === "title" ? titleStyle.font : subtitleStyle.font,
                      })
                    }
                    className="p-2 border border-gray-600 rounded text-xs hover:bg-gray-700 text-gray-200"
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Font weight:</label>
              <div className="grid grid-cols-2 gap-2">
                {fontOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={() =>
                      applyTextStyle({
                        gradient: currentTextInput === "title" ? titleStyle.gradient : subtitleStyle.gradient,
                        animation: currentTextInput === "title" ? titleStyle.animation : subtitleStyle.animation,
                        font: option.class,
                      })
                    }
                    className="p-2 border border-gray-600 rounded text-xs hover:bg-gray-700 text-gray-200"
                  >
                    <span className={option.class}>{option.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 -z-10">
      {backgroundSettings.type === "video" && currentVideo && (
        <iframe
          src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1&mute=1&controls=0&loop=1&playlist=${currentVideo}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: backgroundSettings.opacity }}
        />
      )}
      {backgroundSettings.type === "gradient" && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: backgroundSettings.gradient,
            opacity: backgroundSettings.opacity,
          }}
        />
      )}
      {backgroundSettings.type === "image" && backgroundSettings.imageUrl && (
        <div
          className="absolute inset-0 bg-center bg-cover transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${backgroundSettings.imageUrl})`,
            opacity: backgroundSettings.opacity,
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
    </div>
  )
}
