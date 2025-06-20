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
      const videoId = extractYouTubeId(backgroundSettings.videoUrl)
      setCurrentVideo(videoId || "")
    }
  }, [backgroundSettings])

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

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
        detail: {
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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
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

  // Render background based on current settings
  if (backgroundSettings.type === "gradient") {
    return (
      <>
        <div
          className="fixed inset-0 z-0"
          style={{
            background: backgroundSettings.gradient,
            opacity: backgroundSettings.opacity,
          }}
        />

        {/* Custom Panel Button */}
        <button
          onClick={() => setShowCustomPanel(!showCustomPanel)}
          className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          title="Tùy chỉnh giao diện"
        >
          🎨
        </button>

        {/* Custom Panel */}
        {showCustomPanel && (
          <div className="fixed top-16 right-4 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md border border-gray-700 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">🎨 Tùy Chỉnh Giao Diện</h3>

            {/* Text Styling */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">✨ Hiệu Ứng Chữ</h4>
              <div className="space-y-2">
                <button
                  onClick={() => openStyleDialog("title")}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 text-sm"
                >
                  🎭 Style Tiêu Đề
                </button>
                <button
                  onClick={() => openStyleDialog("subtitle")}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 text-sm"
                >
                  📝 Style Phụ Đề
                </button>
              </div>
            </div>

            {/* YouTube Integration */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">📺 YouTube Background</h4>
              <input
                type="text"
                value={youtubeUrl}
                onChange={handleYoutubeUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Sẽ tự động lấy thumbnail từ video YouTube.</p>
            </div>

            {/* Image Link */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">🔗 Link Ảnh Background</h4>
              <input
                type="text"
                value={imageLink}
                onChange={handleImageLinkChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Link trực tiếp đến file ảnh.</p>
            </div>

            {/* Video Upload */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">🎬 Video Background</h4>
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi"
                onChange={handleVideoChange}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI. Tối đa 100MB.</p>
            </div>
          </div>
        )}

        {/* Text Style Dialog */}
        <TextStyleDialog />
      </>
    )
  }

  if (backgroundSettings.type === "video" && currentVideo) {
    return (
      <>
        <div className="fixed inset-0 z-0 overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1&mute=1&loop=1&playlist=${currentVideo}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
            className="absolute top-1/2 left-1/2 w-[177.77777778vh] h-[56.25vw] min-h-full min-w-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ opacity: backgroundSettings.opacity }}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
          />
        </div>

        {/* Custom Panel Button */}
        <button
          onClick={() => setShowCustomPanel(!showCustomPanel)}
          className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          title="Tùy chỉnh giao diện"
        >
          🎨
        </button>

        {/* Custom Panel */}
        {showCustomPanel && (
          <div className="fixed top-16 right-4 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md border border-gray-700 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">🎨 Tùy Chỉnh Giao Diện</h3>

            {/* Text Styling */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">✨ Hiệu Ứng Chữ</h4>
              <div className="space-y-2">
                <button
                  onClick={() => openStyleDialog("title")}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 text-sm"
                >
                  🎭 Style Tiêu Đề
                </button>
                <button
                  onClick={() => openStyleDialog("subtitle")}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 text-sm"
                >
                  📝 Style Phụ Đề
                </button>
              </div>
            </div>

            {/* YouTube Integration */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">📺 YouTube Background</h4>
              <input
                type="text"
                value={youtubeUrl}
                onChange={handleYoutubeUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Sẽ tự động lấy thumbnail từ video YouTube.</p>
            </div>

            {/* Image Link */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">🔗 Link Ảnh Background</h4>
              <input
                type="text"
                value={imageLink}
                onChange={handleImageLinkChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Link trực tiếp đến file ảnh.</p>
            </div>

            {/* Video Upload */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">🎬 Video Background</h4>
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi"
                onChange={handleVideoChange}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI. Tối đa 100MB.</p>
            </div>
          </div>
        )}

        {/* Text Style Dialog */}
        <TextStyleDialog />
      </>
    )
  }

  return (
    <>
      {/* Default gradient background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          opacity: 0.3,
        }}
      />

      {/* Custom Panel Button */}
      <button
        onClick={() => setShowCustomPanel(!showCustomPanel)}
        className="fixed top-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
        title="Tùy chỉnh giao diện"
      >
        🎨
      </button>

      {/* Custom Panel */}
      {showCustomPanel && (
        <div className="fixed top-16 right-4 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-md border border-gray-700 rounded-lg p-6 w-80 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">🎨 Tùy Chỉnh Giao Diện</h3>

          {/* Text Styling */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">✨ Hiệu Ứng Chữ</h4>
            <div className="space-y-2">
              <button
                onClick={() => openStyleDialog("title")}
                className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 text-sm"
              >
                🎭 Style Tiêu Đề
              </button>
              <button
                onClick={() => openStyleDialog("subtitle")}
                className="w-full p-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 text-sm"
              >
                📝 Style Phụ Đề
              </button>
            </div>
          </div>

          {/* YouTube Integration */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">📺 YouTube Background</h4>
            <input
              type="text"
              value={youtubeUrl}
              onChange={handleYoutubeUrlChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Sẽ tự động lấy thumbnail từ video YouTube.</p>
          </div>

          {/* Image Link */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">🔗 Link Ảnh Background</h4>
            <input
              type="text"
              value={imageLink}
              onChange={handleImageLinkChange}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Link trực tiếp đến file ảnh.</p>
          </div>

          {/* Video Upload */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">🎬 Video Background</h4>
            <input
              type="file"
              accept="video/mp4,video/mov,video/avi"
              onChange={handleVideoChange}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-gray-200 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI. Tối đa 100MB.</p>
          </div>
        </div>
      )}

      {/* Text Style Dialog */}
      <TextStyleDialog />
    </>
  )
}
